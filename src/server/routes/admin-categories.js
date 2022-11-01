import {Router} from 'express'
import bodyParser from 'body-parser'

import ensureAdmin from '../middlewares/ensure-admin'
import Category from '../models/category'

const r = new Router()

r.use(ensureAdmin)
r.use(bodyParser.json())

r.get('/', async (req, res) => {
  const allCategories = await Category.forge().fetchAll()
  res.json(allCategories)
})

r.post('/', async (req, res) => {
  await Category.forge({...req.body}).save()
  res.end()
})

r.put('/:id/images', async (req, res) => {
  const {id} = req.params
  await Category.where({id}).save({
    images: req.body
  }, {patch: true})
  res.end()
})

r.delete('/:id', async (req, res) => {
  const {id} = req.params
  await Category.where({id}).destroy()
})

export default r
