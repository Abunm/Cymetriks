import {Router} from "express"
import bodyParser from "body-parser"
import moment from "moment"
import isEmail from "validator/lib/isEmail"
import nodemailer from "nodemailer"
import uuidV4 from "uuid/v4"
import {d, s} from "readable-time"

import User from "../models/user"
import Pro from "../models/pro"
import OfferPosition from "../models/offer-position"
import {getConfig} from "../db-config"
import ensureUser from "../middlewares/ensure-user"

import {isPointInCircle} from "geolib"
import {hash} from "../../lib/crypto"

import redisClient from "../redis-client"
import {baseUrl} from "../../config"
import * as admin from "firebase-admin"

const transporter = nodemailer.createTransport({
  host: "mail.gandi.net",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@winwin-apps.com",
    pass: "#>;$;/]jF7n&Bp-{",
  },
})

const r = new Router()

r.use(bodyParser.json())

r.post("/", async (req, res) => {
  const {password, passwordMatch} = req.body
  const username = req.body.username.trim().toLowerCase()
  const email = req.body.email.trim().toLowerCase()

  if (username.length < 3 || username.length > 10) {
    return res.status(400).send("Username invalide")
  }

  if (passwordMatch !== password) {
    return res.status(400).send("Les deux mot de passes sont différents")
  }

  if (!isEmail(email)) {
    return res.status(400).send("Cette email est invalide")
  }

  const user = await User.where({username}).fetch()
  if (user) {
    return res.status(400).send("Ce pseudo est déjà pris")
  }

  const userByEmail = await User.where({email}).fetch()
  if (userByEmail) {
    return res.status(400).send("Cette email est déjà pris")
  }

  const passwordDigest = await hash(password)

  const saved = await User.forge({
    username,
    passwordDigest,
    email,
  }).save()

  res.json(saved)
})

function resetEmail(to, url) {
  return {
    from: '"Equipe WinWin" <noreply@winwin-apps.com>',
    to,
    subject: "Reset du mot de passe",
    html : `
      <p>Bonjour,

      Vous pouvez réinitialiser votre mot de passe en suivant le lien suivant:
	  </p>
      <a href="${url}">Cliquez ici</a>
		
	  <p>
      Ce lien est valide pendant 3 jours.
	
	  </p>
      <p>Cordialement,
	  </p>
	  <p>
      L'Equipe de WinWin
	  </p>
    `,
  }
}

r.post("/me/notif", async (req, res) => {
	try {
		const me = await User.where({id: req.currentUser.id}).fetch()
		await me.save({
			fcmToken: req.body.token
		},{patch: true})
		res.status(200).end()
	} catch (e) {
		res.status(400).send("Error changing token")
	}
})

r.post("/forgot", async (req, res) => {
  const {email} = req.body

  if (!email || !isEmail(email)) {
    res.status(400).send("Email invalide")
    return
  }

  const key = uuidV4()

  redisClient.set(key, email).then(() => {
    redisClient.expire(key, 3::d() / 1::s())
  })
  
  try{
	
  await transporter.sendMail(
    resetEmail(email, `${baseUrl}/resetUser?key=${key}`),
  )

  res.send(`L'email a bien été envoyé`)
  
}catch(e) {
	res.status(400).send(e)
}

})

r.post("/reset", async (req, res) => {
  const {password, key} = req.body

  const email = await redisClient.get(key)

  if (!email) {
    res.status(400).send("La clé n'est pas valide")
    return
  }

  const [user, passwordDigest] = await Promise.all([
    User.where({email}).fetch(),
    hash(password),
  ])

  await Promise.all([
    user.save({passwordDigest}, {patch: true}),
    redisClient.del(key),
  ])

  res.end()
})

r.use(ensureUser)

r.put("/me", async (req, res) => {
	try{
  await User.forge({id: req.currentUser.id}).save(req.body, {patch: true})
  const user = await User.forge({id: req.currentUser.id}).fetch()

  res.json(user)
	}
	catch (e) {
		res.status(400).send("Ce pseudo est déja pris !")
	}
})

r.post("/me/windome", async (req, res) => {
  const config = await getConfig()
  const costWindome = parseInt(config["cout windome"], 10)
  const durationWindome = parseInt(config["duree windome"], 10)
  const key = `windome:${req.currentUser.id}`

  if (req.currentUser.winpoints - costWindome < 0) {
    return res.status(400).send("Pas assez de WinPoints")
  }

  await redisClient.set(key, 1)
  await redisClient.expire(key, durationWindome)
  const me = await User.where({id: req.currentUser.id}).fetch()
  await me.save({winpoints: me.get("winpoints") - costWindome}, {patch: true})

  res.json(me)
})

r.get("/me/windome", async (req, res) => {
  const config = await getConfig()
  const costWindome = parseInt(config["cout windome"], 10)
  const durationWindome = parseInt(config["duree windome"], 10)
  const ttl = await redisClient.ttl(`windome:${req.currentUser.id}`)

  res.json({
    costWindome,
    durationWindome,
    ttl,
  })
})

async function getOffers(owner, used = false) {
  return await OfferPosition.query(qb => {
    qb.where({owner, used})
    if (!used) {
      qb.innerJoin("offers", "offer_positions.offerId", "offers.id")
      qb.where("offers.until", ">", moment())
    }
  }).fetchAll({withRelated: ["offer", "offer.category", "offer.pro"]})
}

r.get("/me/offers", async (req, res) => {
  const offers = await getOffers(req.currentUser.id)
  res.json({offers})
})

r.get("/me/offers/used", async (req, res) => {
  res.json({
    offers: await getOffers(req.currentUser.id, true),
  })
})


r.post("/me/offers/:offerId", async (req, res) => {
  // TODO check if in the area
  
  const offer = await OfferPosition.where({id: req.params.offerId}).fetch({
    withRelated: ["offer"],
  })
  
  if(offer.related("offer").get("owner") != null){
		res.status(418).send("Cette offre est déja prise")
		return
	}
	
	

  if (offer.related("offer").get("winpts")) {
    const [value] = offer.related("offer").get("label").split(" ")
    const me = await User.where({id: req.currentUser.id}).fetch()
	const oWp = parseInt(me.get("winpoints"), 10)
    await me.save(
      {
        winpoints: oWp + parseInt(value, 10),
      },
      {
        patch: true,
      },
    )
    await offer.save({used: true}, {patch: true})
  } else {
  

  const config = await getConfig()
  const value = parseInt(config["valeur initial offre"], 10) || 100

  if (offer) {
    await offer.save(
      {
        owner: req.currentUser.id, 
        value,
      },
      {patch: true},
    )
  }
  }
  res.status(200).end()
  
})

r.post("/me/offers/:offerId/use", async (req, res) => {
  const offer = await OfferPosition.where({id: req.params.offerId}).fetch()

  if (offer) {
	if(offer.get("owner") === req.currentUser.id)
	{
		await offer.save({used: true}, {patch: true})
		res.json(offer)
	}
	else{
		res.status(400).send("Cette offre ne vous appartient plus")
	}
  } else {
    res.status(404).send("Cette offre n'existe plus")
  }
})

r.post("/me/offers/:offerId/cancel", async (req, res) => {
  const offer = await OfferPosition.where({id: req.params.offerId}).fetch()

  if (offer) {
    if(offer.get("owner") === req.currentUser.id)
	{
		await offer.save({owner: null}, {patch: true})
		res.json(offer)
	}
	else{
		res.status(400).send("Cette offre ne vous appartient plus")
	}
  } else {
    res.status(404)
  }
})

r.post("/me/offers/:offerId/send", async (req, res) => {
  const offer = await OfferPosition.where({id: req.params.offerId}).fetch()
  const friend = await User.where({username: req.body.params.friend}).fetch()
  const me = await User.where({id: req.currentUser.id}).fetch()
  
  if(req.currentUser.id !== offer.get("owner"))
  {
	 res.status(400).send("Cette offre ne vous appartient plus")
  }
  else {
	 offer.save({
		 owner: friend.get("id")
	 },
	 {patch: true})
	 res.status(200).send("Succès !")
  }
  
  var registrationToken = friend.get("fcmToken");
	var fname = me.get("username")

	var message = {
	notification: {
		title: 'Offre',
		body : fname +' vous a envoyé une offre',
		image : baseUrl+'/public/img/winwin512.png',
	},
		token: registrationToken
	};
	
		
		
		try {
			await admin.messaging().send(message)
		} catch(error) {
			console.log('Error sending message, probably user gone:', error);
			await friend.save({fcmToken: null},{patch: true})
		}
})

async function changeOfferValue(value, req, res) {

	const me = await User.where({id: req.currentUser.id}).fetch()
    var points = parseInt(me.get("winpoints"), 10)
	if(points - value < 0)
	{
		res.status(400).send("Pas assez de winpoints")
	} else {
		const offer = await OfferPosition.where({id: req.params.offerId}).fetch()
		
		var offerval = parseInt(offer.get("value"), 10)
		
		if(offerval + value < 0)
		{
			res.status(400).send("Cette offre est au minimum")
		}
		else {
			await me.save({
				winpoints: points - value
			},
			{patch: true})
			await offer.save({
				value: offerval + value
			},
			{patch: true})
			res.json({
				me: points - value,
				offer: offerval + value,
			})
		}
	}
}

r.post("/me/offers/:offerId/increase", (req, res) => {
  changeOfferValue(+10, req, res)
})

r.post("/me/offers/:offerId/decrease", (req, res) => {
  changeOfferValue(-10, req, res)
})

r.post("/me/sendWinPts", async (req, res) => {
  const me = await User.where({id: req.currentUser.id}).fetch()
  const friend = await User.where({username: req.body.params.friend}).fetch().catch(e => {
		res.status(404).send("Utilisateur non trouvé")
		return
	})
	
	if(me.get("winpoints") < req.body.params.amount)
	{
		res.status(400).send("Pas assez de winpoints")
	}
	else {
		var act = friend.get("winpoints")
		await friend.save(
		{
			winpoints: act + req.body.params.amount
		},
		{patch: true},
		)
		act = me.get("winpoints")
		await me.save(
		{
			winpoints: act - req.body.params.amount
		},
		{patch: true},
		)
		res.status(200).send("")
	}
	var registrationToken = friend.get("fcmToken");
	var fname = me.get("username")

	var message = {
	notification: {
		title: 'WinPoints',
		body : fname + ' vous a envoyé ' + req.body.params.amount + ' winpoints!',
		image : baseUrl+'/public/img/winwin512.png',
	},
		token: registrationToken
	};
	
		
		
		try {
			await admin.messaging().send(message)
		} catch(error) {
			console.log('Error sending message, probably user gone:', error);
			await friend.save({fcmToken: null},{patch: true})
		}
})

r.get("/me/friends", async (req, res) => {
	const me = await User.where({id: req.currentUser.id}).fetch()
	const friends = me.get('friends')
	const friendsReq = me.get('friends_requests')
	res.json({friends, friendsReq})
})


r.post("/me/addFriend", async (req, res) => {
	const me = await User.where({id: req.currentUser.id}).fetch()
	const friend = await User.where({username: req.body.params.friend}).fetch().catch(e => {
		res.status(404).send("Utilisateur non trouvé")
		return
	})
	
	if(friend == null){
		res.status(404).send("Utilisateur non trouvé")
		return
	}
	
	
	if(me.get("username") === req.body.params.friend) {
		res.status(400).send("Vous ne pouvez pas vous ajouter en ami !")
		return
	}
	if(friend.get("friends_requests") != null)
	{
		if(friend.get("friends_requests").indexOf(me.get("username")) !== -1)
		{
			res.status(400).send("Vous avez déja envoyé une demande à "+ friend.get("username"))
			return
		}
	}
	if(me.get("friends") != null)
	{
		if(me.get("friends").indexOf(req.body.params.friend) !== -1)
		{
			res.status(400).send("Vous êtes déja amis !")
			return
		}
	}

	var list = friend.get("friends_requests")
	if(list == null){
		list = []
	}
	list.push(me.get("username"))
	
	await friend.save(
	{
		friends_requests: list
	},
	{patch: true},
	)
	
	var registrationToken = friend.get("fcmToken");

		var message = {
		notification: {
			title: 'Nouvelle demande d\'ami',
			body : me.get("username")+ ' viens de vous demander en ami sur WinWin ! (sur votre compte '+friend.get("username")+' )',
			image : baseUrl+'/public/img/winwin512.png',
		},
		token: registrationToken
		};
	
		
		try {
			await admin.messaging().send(message)
		} catch(error) {
			console.log('Error sending message, probably user gone:', error);
			await friend.save({fcmToken: null},{patch: true})
		}
	
	res.status(200).send("Demande envoyée")
	
})

r.post("/me/ansReq", async (req, res) => {
	try{
	const me = await User.where({id: req.currentUser.id}).fetch()
	const friend = await User.where({username: req.body.params.friend}).fetch().catch(e => {
		res.status(404).send("Cet utilisateur n'existe plus")
		return
	})
	
	if(me.get("friends_requests") === null)
	{
		res.status(404).send("Demande d'ami non trouvée")
		return
	}
	
	var findex = me.get("friends_requests").indexOf(req.body.params.friend)
	
	var Ffindex = -1
	if (friend.get("friends_requests") !== null)
	{
		var Ffindex = friend.get("friends_requests").indexOf(me.get("username"))
	}
	
	if(findex === -1){
		res.status(404).send("Demande d'ami non trouvée")
		return
	}
	
	var listF = me.get("friends")
	var listFF = friend.get("friends")
	var listR = me.get("friends_requests")
	var listFR = friend.get("friends_requests")
	
	
	if(req.body.params.ans){ //si la réponse est positive, la requette devient un ami
		if(listF == null){
			listF = []
		}
		if(listFF == null){
			listFF = []
		}
		if(listFR == null){
			listFR = []
		}
		listF.push(req.body.params.friend)
		listFF.push(me.get("username"))
		listR.pop(findex)
		if(Ffindex !== -1)
		{
			listFR.pop(Ffindex)
		}
		
	} else { //sinon, elle est juste suprimée
		listR.pop(findex)
		if(Ffindex !== -1) //si double requette, supprimée aussi
		{
			listFR.pop(Ffindex)
		}

	}
	
	await me.save(
		{
			friends: listF,
			friends_requests : listR
		},
		{patch: true},
		)
	await friend.save(
		{
			friends: listFF,
			friends_requests: listFR
		},
		{patch: true},
		)
	res.status(200)
	} catch(e) {
		console.log(e)
	}
})



r.post("/me/remFriend", async (req, res) => {
	const me = await User.where({id: req.currentUser.id}).fetch()
	
	var friendExist = true
	
	const friend = await User.where({username: req.body.params.friend}).fetch().catch(e => {
		friendExist = false
	})
	
	
	var findex = me.get("friends").indexOf(req.body.params.friend)
	
	if(findex === -1){
		res.status(404).send("Cet personne n'est pas dans votre liste d'amis !")
	} else {
	
		var list = me.get("friends")
		list.pop(findex)
	
		await me.save(
		{
			friends: list
		},
		{patch: true},
		)
	
		if(friendExist){
			findex = friend.get("friends").indexOf(me.get("username"))
			if(findex !== -1)
			{
				list = friend.get("friends")
				list.pop(findex)
	
				await friend.save(
				{
					friends: list
				},
				{patch: true},
				)
			}
		}	
		res.status(200).send("Succes !")
	}
})

r.get("/me/checkOwner/:id", async (req, res) => {
	const offer = await OfferPosition.where({id: req.params.id}).fetch({
    withRelated: ["owner"],
  })
  
  if (offer.get("owner") !== req.currentUser.id)
  {
	  res.json({is: false})
  }else{
	  res.json({is: true})
  }
	
})

r.post("/me/fav/:company/toggle", async (req, res) => {
	const me = await User.where({id: req.currentUser.id}).fetch()
	const pro = await Pro.where({companyName: req.params.company}).fetch()
	
	if(pro === null)
	{
		res.status(404).send("Cette companie n'existe pas")
		return
	}
	else{
		
	var fav = me.get("favorites")
	var fvtoken = pro.get("haveFavToken")

	if(fav == null)
	{
		fav = []
	}
	if(fvtoken == null)
	{
		fvtoken = []
	}
  
	var index = fav.indexOf(req.params.company)
	var proindex = fvtoken.indexOf(me.get("fcmToken"))
	
	if (index !== -1)
	{
		if(proindex !== -1)
		{
			fvtoken.pop(proindex)
			await pro.save({
				haveFavToken: fvtoken
			},
			{patch: true},)
		}
		fav.pop(index)
		await me.save({
		  favorites: fav
		},
		{patch: true},)
		res.status(200).send("Ok")
	}else{
		fav.push(req.params.company)
		if(me.get("fcmToken") !== null)
		{
			fvtoken.push(me.get("fcmToken"))
			await pro.save({
				haveFavToken: fvtoken
			},
			{patch: true},)
		}
		await me.save({
		  favorites: fav
		},
		{patch: true},)
		res.status(200).send("Ok")
	}
	}
	
})

r.get("/me/fav/", async (req, res) => {
	const me = await User.where({id: req.currentUser.id}).fetch()
	
	res.json({favorites: me.get("favorites")})
	
})

r.post("/me/offers/:offerId/steal", async (req, res) => {
  const offer = await OfferPosition.where({id: req.params.offerId}).fetch({
    withRelated: ["owner"],
  })

  if (offer) {
    const {x: otherX, y: otherY} = offer.related("owner").get("lastPosition")
    const {x: meX, y: meY} = req.currentUser.lastPosition
    const config = await getConfig()
    const radius = parseInt(config["distance voler offre"], 10) || 500
    const value = offer.get("value")
	const me = await User.where({id: req.currentUser.id}).fetch()
    const winpoints = me.get("winpoints")
	const ennemi = await User.where({id: offer.get("owner")}).fetch()

    const isCloseEnough = isPointInCircle(
      {latitude: otherX, longitude: otherY},
      {latitude: meX, longitude: meY},
      radius,
    )
	
	const ttl = await redisClient.ttl(`windome:${ennemi.get("id")}`)
    ennemi.set("isVisible", ttl <= 0)

	if (winpoints < value) {
      res.status(400).send("Pas assez de WinPoints")
    } else if (!isCloseEnough) {
      res.status(400).send("Pas assez prêt de ce joueur")
    } else if(offer.get("owner") === req.currentUser.id) {
		res.status(400).send("Vous possédez déja cette offre")
	} else if(offer.get("owner") !== req.body.params.oldUser) {
		res.status(404).send("Cette offre n'appartient plus à cette personne")
	} else if(ennemi.get("isVisible") === false){
		res.status(400).send("Ce joueur est protégé") 
	} else {
      const addValue = parseInt(config["majoration offre"], 10) || 20
      await offer.save(
        {
          owner: req.currentUser.id,
          value: offer.get("value") + addValue,
        },
        {patch: true},
      )
      await me.save({winpoints: (winpoints - value)}, {patch: true})
      
		const other = await User.where({id: req.body.params.oldUser}).fetch()
		
		var registrationToken = other.get("fcmToken");

		var message = {
		notification: {
			title: 'Au vol !',
			body : 'On vient de vous voler une offre, ouvrez vite l\'application !',
			image : baseUrl+'/public/img/winwin512.png',
		},
		token: registrationToken
		};
	
		
		
		try {
			await admin.messaging().send(message)
		} catch(error) {
			console.log('Error sending message, probably user gone:', error);
			await other.save({fcmToken: null},{patch: true})
		}
		
		res.status(200).end()
    }
  } else {
    res.status(404)
  }
})

export default r
