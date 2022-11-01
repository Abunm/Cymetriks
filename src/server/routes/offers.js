import {Router} from "express"
import bodyParser from "body-parser"

import Offer from "../models/offer"
import Pro from "../models/pro"
import OfferPosition from "../models/offer-position"
import Packs from "../models/packs"

import multer from "multer"
import cloudinary from "cloudinary"
import * as admin from "firebase-admin"
import {baseUrl} from "../../config"

cloudinary.config({
  cloud_name: "winwin-test",
  api_key: "579872142549443",
  api_secret: "yvh2Q3rB1ZTnVdD33ndsVwwVOHM",
})

const upload = multer({storage: multer.diskStorage({})}).single("file")

const r = new Router()
r.use(bodyParser.json())

function times(fn) {
  for (let i = 0; i < this; i++) {
    fn()
  }
}

function generateCode() {
  const code = []
  ;4::times(() => code.push(Math.floor(Math.random() * 10)))
  if (code[0] === 0) {
    code[0] = 1
  }

  return parseInt(code.join(""), 10)
}

r.post("/", async (req, res) => {
	try{
  const proId = req.currentPro.id
  delete req.body.updateCode
  var newOffer = {
    ...req.body,
    proId,
    code: generateCode(),
  }
  const isAdmin = req.currentPro.email === "admin@admin.com"
  if (newOffer.winpts === true && !isAdmin) {
    newOffer.winpts = false
	return
  }
  else if(!newOffer.winpts) {
 
	
	const pro = await Pro.where({id: req.currentPro.id}).fetch()
	const b = parseFloat(pro.get("balance"))
	var p = 0
	
	var pack = await Packs.where({id: req.body.pack.value}).fetch()
	
	newOffer.pack = pack
	
	var packTruePrice = pack.get("price")
	var packTruePers = pack.get("custom")
	
	if(!packTruePers)
	{
		p = parseFloat(packTruePrice)
	}
	else {
		p = parseInt(req.body.offerCount, 10)*parseFloat(packTruePrice)
	}
	
	if(b - p >= 0){
	await pro.save({
		balance: b - p
	}, {
		patch: true
	})
	}else{
		res.status(400).send("Crédits insuffisants")
		return
	}

  }
 

  const saved = await Offer.forge(newOffer).save()
  res.json(saved)
	}
	catch(e){
		res.status(400).send(e)
	}
})

r.put("/:id", async (req, res) => {
  const offer = await Offer.where({id: req.params.id}).fetch()
  if (req.body.updateCode) {
    req.body.code = generateCode()
  }
  delete req.body.updateCode
  req.body.offerCount = offer.get("offerCount")
  req.body.pack = offer.get("pack")
  if (req.currentPro.id === offer.get("proId")) {
    await offer.save(req.body, {patch: true})
	console.log("ok")
    res.end()
  } else {
    res.status(400).send([
      {
        message: "Vous n'êtes pas propriétaire de cette offre",
      },
    ])
  }
})

r.delete("/:id", async (req, res) => {
  const offer = await Offer.where({id: req.params.id}).fetch()
  if (req.currentPro.id === offer.get("proId")) {
    await offer.save(
      {
        deleted: true,
      },
      {patch: true},
    )
  
  //const pro = Pro.where({id: req.currentPro.id}).fetch()
  // var remb = parseFloat(offer.get("pack").price) 
  // if(offer.pack.custom === "true")
  // {
	  // remb = remb*parseInt(offer.get("offerCount"))
  // }
  // remb = remb + parseFloat(pro.get("balance"))
  // await pro.save({
	  // balance: remb
  // },
  // {patch: true},
  // )
  }
  res.end()
})

r.get("/", async (req, res) => {
  const proId = req.currentPro.id
  const offers = await Offer.where({proId, deleted: false}).fetchAll({
    withRelated: ["category"],
  })
  await Promise.all(
    offers.map(async offer => {
      const [all, catched, used] = await Promise.all([
        offer.positions().count(),
        offer.positions().query("where", "owner", "is not", null).count(),
        offer.positions().query("where", "used", true).count(),
      ])
      offer.set("totalCount", all)
      offer.set("catchedCount", catched)
      offer.set("usedCount", used)
    }),
  )
  res.json(offers)
})

r.post("/:offerId/positions", async (req, res) => {
  const positions = req.body
  const {offerId} = req.params
  
  try {
    await OfferPosition.where({offerId, owner: null}).destroy()
  } catch (e) {}
  for (const [lat, lng] of positions) {
    await OfferPosition.forge({
      offerId,
      position: `(${lat}, ${lng})`,
    }).save()
  }
  const offer = await Offer.where({id: offerId}).fetch()
  const pro = await Pro.where({id: offer.get("proId")}).fetch()
  
  const name = pro.get("companyName")
  
	const registrationTokens = pro.get("haveFavToken")
	//console.log(registrationTokens)


	const message = {
	notification: {
				title: 'Nouvelle offre',
				body : name + ' nous fait rêver, attrapez leurs nouvelles offres dès maintenant !',
				image : baseUrl+'/public/img/winwin512.png',
	},
	tokens: registrationTokens,
	}
	await Offer.where({id: req.params.offerId}).save({
		offerCount: 0
	},
	{patch: true}
	)
	
	admin.messaging().sendMulticast(message).then((response) => {
	
	
	if (response.failureCount > 0) {
      const failedTokens = [];
		response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(registrationTokens[idx]);
        }
      });
      console.log('List of tokens that caused failures: ' + failedTokens);
    }
	}).catch((e) => console.log(e))
  res.end()
})

r.post("/:offerId/upload", upload, async (req, res) => {
  const offer = await Offer.where({id: req.params.offerId}).fetch()
  const [adType] = req.file.mimetype.split("/")
  const isVideo = adType === "video"
  const {eager: [{secure_url}]} = await cloudinary.v2.uploader.upload(
    req.file.path,
    {
      public_id: req.params.offerId,
      resource_type: adType,
      eager: [
        {
          width: 600,
          crop: "scale",
          quality: 80,
          format: isVideo ? "mp4" : undefined,
        },
      ],
    },
  )
  await offer.save({ad: secure_url, adType}, {patch: true})
  res.end()
})

r.get("/:offerId/positions", async (req, res) => {
  const {offerId} = req.params
  const offerPositions = await OfferPosition.where({
    offerId,
    owner: null,
  }).fetchAll()
  res.json(offerPositions.map(pos => pos.get("position")))
})

r.get("/:offerId/positions/all", async (req, res) => {
  const {offerId} = req.params
  const offerPositions = await OfferPosition.where({offerId}).fetchAll({
    withRelated: ["owner"],
  })
  res.json(offerPositions)
})

export default r
