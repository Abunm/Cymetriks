import {Router} from 'express'
import bodyParser from 'body-parser'
import isEmail from 'validator/lib/isEmail'
import nodemailer from 'nodemailer'
import uuidV4 from 'uuid/v4'
import {d, s} from 'readable-time'

import Pro from '../models/pro'
import Bill from '../models/bill'

import {hash} from '../../lib/crypto'
import redisClient from '../redis-client'
import {baseUrl, devMail} from '../../config'
import {getConfig} from '../db-config'

const transporter = nodemailer.createTransport({
  host: "mail.gandi.net",
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@winwin-apps.com',
    pass: '#>;$;/]jF7n&Bp-{',
  }
})

const r = new Router()

r.use(bodyParser.json())

r.post('/', async (req, res) => {
  const {shopLocation: {lat, lon}, password, ...body} = req.body
  const passwordDigest = await hash(password)

  delete body.passwordConfirm
  delete body.validated

  const newPro = {
    ...body,
    passwordDigest,
    shopLocation: `(${lat}, ${lon})`,
  }

  try {
    const saved = await Pro.forge(newPro).save()
    res.json(saved)
    transporter.sendMail({
      from: '"Equipe WinWin" <noreply@winwin-apps.com>',
      to: devMail,
      subject: "Noueau pro a validé dans le panneau admin",
      text: `
        Bonjour,

        Un nouveau Pro s'est inscrit sur le site.
        Pour le valider: ${baseUrl}/admin/validations/pro

        Cordialement,
        L'Equipe de WinWin
    `
    })
  } catch (e) {
    if (e.constraint === 'pros_email_unique') {
      res.status(400).send('This email is already registered... Try login ?')
    } else {
      console.log(e)
      res.status(500)
    }
  }
})

function resetEmail(to, url) {
  return {
    from: '"Equipe WinWin" <noreply@winwin-apps.com>',
    to,
    subject: "Reset du mot de passe",
    text: `
      Bonjour,

      Vous pouvez réinitialiser vôtre mot de passe en suivant le lien suivant:
      ${url}

      Ce lien est valide pendant 3 jours.

      Cordialement,
      L'Equipe de WinWin
    `
  }
}

r.post('/forgot', async (req, res) => {
  const {email} = req.body

  if (!email || !isEmail(email)) {
    res.status(400).send('Email invalide')
    return
  }

  const key = uuidV4()

  redisClient.set(key, email).then(() => {
    redisClient.expire(key, 3::d() / 1::s())
  })
  console.log("waypoint1")

try{
  await transporter.sendMail(resetEmail(
    email,
    `${baseUrl}/reset?key=${key}`
  ))
 console.log("waypoint2")
  res.send(`L'email a bien été envoyé`)
}catch(e){
	res.status(400).send(e)
}
})

r.post('/reset', async (req, res) => {
  const {
    password,
    key,
  } = req.body

  const email = await redisClient.get(key)

  if (!email) {
    res.status(400).send("La clé n'est pas valide")
    return
  }

  const [pro, passwordDigest] = await Promise.all([
    Pro.where({email}).fetch(),
    hash(password),
  ])

  await Promise.all([
    pro.save({passwordDigest}, {patch: true}),
    redisClient.del(key),
  ])

  res.end()
})

r.get('/me', async (req, res) => {
  if (!req.currentPro) {
    res.status(404).end()
    return
  }

  delete req.currentPro.passwordDigest

  res.json({
    ...req.currentPro,
  }).end()
})

r.get('/me/bills', async (req, res) => {
  if (!req.currentPro) {
    res.status(404).end()
    return
  }

  let bills = []
  if (req.currentPro.email === 'admin@admin.com') {
    bills = await Bill.fetchAll()
  } else {
    bills = await Bill.where({proId: req.currentPro.id}).fetchAll()
  }

  res.json(bills)
})

r.get('/me/bills/:id', async (req, res) => {
  if (!req.currentPro) {
    res.status(404).end()
    return
  }

  try {
    const bill = await Bill
      .forge({id: req.params.id})
      .fetch({withRelated: ['pro']})
    if (req.currentPro.email !== 'admin@admin.com' &&
        req.currentPro.id !== bill.related('pro').get('id')) {
      throw new Error('err')
    }
    const conf = await getConfig()
    bill.set('address', conf['Addresse de la société'])
    res.json(bill)
  } catch (e) {
    console.error(e)
    res.status(404).end()
    return
  }
})

export default r
