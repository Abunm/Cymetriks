import {Router} from "express"

import Category from "../models/category"

const r = new Router()

r.get("/", async (req, res) => {
  const allCategories = await Category.forge().fetchAll()
  res.json(allCategories)
})

export default r
