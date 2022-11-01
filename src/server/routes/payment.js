import {Router} from "express"
import bodyParser from "body-parser"
import ensurePro from "../middlewares/ensure-pro"
import Config from "../models/config"
import Pro from "../models/pro"
import Bill from "../models/bill"
import {getConfig} from "../db-config"

import {secretKey as stripeSecretKey} from "../../lib/stripe"

import Packs from "../models/packs"
import {invalidCache} from '../db-config'

const stripe = require("stripe")(stripeSecretKey)

const r = new Router()

r.use(bodyParser.json())

async function getPaymentConfig() {
  const [offerPrice] = (await Promise.all([
    Config.where({name: "prix pour offres"}).fetch(),
  ])).map(conf => conf.get("value"))

  return {offerPrice}
}

r.get("/", async (req, res) => {
  res.json(await getPaymentConfig())
})

r.get("/Packs", async (req, res) => {
  const allPacks = await Packs.forge().fetchAll()
  res.json(allPacks)
  
})

r.put('/Packs', async (req, res) => {
  invalidCache()
  const {id, value} = req.body
  await Packs.where({id}).save({price: value}, {patch: true})
  const packs = await Packs.fetchAll()
  res.json(packs)
})

r.post("/", ensurePro, async (req, res) => {
  const {stripeToken, balance} = req.body

  try {
    await stripe.charges.create({
      amount: balance,
      currency: "EUR",
      source: stripeToken.id,
    })

    const pro = await Pro.where({id: req.currentPro.id}).fetch()
    pro.set("balance", pro.get("balance") + balance)
    const shopLocation = await pro.get("shopLocation")
    pro.set("shopLocation", `(${shopLocation.x}, ${shopLocation.y})`)
    await pro.save()
    pro.set("shopLocation", shopLocation)

    const currentYear = new Date().getFullYear()
    const beginYear = new Date(currentYear, 0)
    const endYear = new Date(currentYear, 11, 23, 59, 59)

    Bill.query(qb => qb.whereBetween("created_at", [beginYear, endYear]))
      .count()
      .then(async count => {
        const conf = await getConfig()
        await Bill.forge({
          id: +`${currentYear}${parseInt(count, 10) + 1}`,
          proId: req.currentPro.id,
          nbOffers: "",
          price: balance,
          tax: parseFloat(conf["TVA"]) || 0.2,
        }).save(null, {method: "insert"})
      })

    res.json(pro)
  } catch (e) {
    console.log(e)
    res.status(400).json(e)
  }
})

export default r
