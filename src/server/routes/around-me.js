import {Router} from "express"
import OfferPosition from "../models/offer-position"

import User from "../models/user"
import {m} from "../../lib/metrics"
import {getConfig} from "../db-config"

import redisClient from "../redis-client"
import moment from "moment"
import "moment-timezone"
import {getDistance} from "geolib"



async function addVisibility(users) {
  const promises = users.map(async u => {
    const ttl = await redisClient.ttl(`windome:${u.get("id")}`)
    u.set("isVisible", ttl <= 0)
  })

  await Promise.all(promises)
}

const r = new Router()

r.get("/:lat/:lon", async (req, res) => {
  const {lat, lon} = req.params
  const config = await getConfig()

  const distanceOffer = parseInt(config["distance prendre offre"], 10) || 500
  const distancePeople = parseInt(config["distance voir ennemi"], 10) || 500
  const distanceGreyOffer = parseInt(config["distance voir offre"], 10) || 500

  const distanceWalking =
    parseInt(config["distance marche winpoints"], 10) || 100
  const amountWalking = parseInt(config["valeur marche winpts"], 10) || 0

  const circleOffer = `circle '((${lat}, ${lon}), ${distanceOffer::m()})'`
  const circlePeople = `circle '((${lat}, ${lon}), ${distancePeople::m()})'`
  const circleGreyOffer = `circle '((${lat}, ${lon}), ${distanceGreyOffer::m()})'`

  let totalDistance =
    parseFloat(await redisClient.get(`distance:${req.currentUser.id}`)) || 10

  if (req.currentUser.lastPosition && req.currentUser.lastPosition.x) {
    const currentDistance = getDistance(
      {
        latitude: req.currentUser.lastPosition.x,
        longitude: req.currentUser.lastPosition.y,
      },
      {latitude: lat, longitude: lon},
      0.1,
      2,
    )

    if (currentDistance < distanceWalking * 2) {
      totalDistance += currentDistance
    }

    if (totalDistance > distanceWalking) {
      totalDistance -= distanceWalking
      await User.forge({id: req.currentUser.id}).save(
        {
          winpoints: req.currentUser.winpoints + amountWalking,
        },
        {
          patch: true,
        },
      )
    }
	
	await User.forge({id: req.currentUser.id}).save(
        {
          last_fetch: Date.now(),
        },
        {
          patch: true,
        },
      )

    await redisClient.set(`distance:${req.currentUser.id}`, totalDistance)
  }

  if (req.currentUser) {
    await User.forge({id: req.currentUser.id}).save({
      lastPosition: `(${lat}, ${lon})`,
    })
  }
	
  const offers = await OfferPosition.query(qb => {
    qb.innerJoin("offers", "offer_positions.offerId", "offers.id")
    qb.whereRaw(`position <@ ${circleOffer}`)
    qb.whereNull("offer_positions.owner")
    qb.where("used", false)
    qb.where("offers.deleted", false)
  }).fetchAll({withRelated: ["offer", "offer.category", "offer.pro"]})

  const greyOffers = await OfferPosition.query(qb => {
    qb.innerJoin("offers", "offer_positions.offerId", "offers.id")
    qb.whereRaw(`not position <@ ${circleOffer}`)
    qb.whereRaw(`position <@ ${circleGreyOffer}`)
    qb.whereNull("offer_positions.owner")
    qb.where("used", false)
    qb.where("offers.deleted", false)
  }).fetchAll({withRelated: ["offer", "offer.category", "offer.pro"]})

  const users = await User.query(qb => {
    qb.whereRaw(`"lastPosition" <@ ${circlePeople}`)
  }).fetchAll({
    withRelated: [
      {
        offers: qb => {
          qb.where({used: false})
          qb.innerJoin("offers", "offers.id", "offer_positions.offerId")
          qb.where("offers.until", ">", moment())
        },
      },
      "offers.offer",
      "offers.offer.category",
      "offers.offer.pro",
    ],
  })

  const params = config["Temps visibilité user"]
      ? config["Temps visibilité user"]
      : 3600
	  
	var okTime = Date.now() - parseInt(params, 10)*1000

  await addVisibility(users)
  
  var fuser = users.filter((user) => {
		var up = parseInt(user.get("last_fetch"), 10)
		if(user.get("isVisible") && (up > okTime)) {
			return true
		} else {
			return false
	}})
	
	
	
  res.json({
    me: req.currentUser,
    offers: offers.filter(
      p =>
        p.related("offer").get("winpts") ||
        moment(p.related("offer").get("until")) > moment(),
    ),
    users: fuser,
    greyOffers: greyOffers.filter(
      p => moment(p.related("offer").get("until")) > moment(),
    ),
  })
  
})

export default r
