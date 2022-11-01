import Bookshelf from "../../bookshelf"
import OfferPosition from "./offer-position"

import redisClient from "../redis-client"

class User extends Bookshelf.Model {
  constructor(...props) {
    super(...props)
    this.on("fetched", async model => {
      const ttl = await redisClient.ttl(`windome:${model.get("id")}`)
      model.set("isVisible", ttl <= 0)
    })
  }

  get tableName() {
    return "users"
  }

  get hasTimestamps() {
    return true
  }

  offers() {
    return this.hasMany(OfferPosition, "owner")
  }
}

export default User
