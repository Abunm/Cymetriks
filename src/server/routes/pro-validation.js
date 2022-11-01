import {Router} from 'express'
import bodyParser from 'body-parser'

import ensureAdmin from '../middlewares/ensure-admin'
import Pro from '../models/pro'

const r = new Router()

r.use(ensureAdmin)
r.use(bodyParser.json())

r.get('/', async (req, res) => {
  const notValidatedPros = await Pro.where({validated: false}).fetchAll()
  res.json(notValidatedPros)
})

r.delete('/:id', async (req, res) => {
  const {id} = req.params
  await Pro.where({id}).destroy()
  res.end()
})

r.put('/', async (req, res) => {
  const {id} = req.body
  await Pro.forge({id}).save({validated: true}, {patch: true})
  res.end()
})

export default r
