import jwt from 'jsonwebtoken'

import {appSecret} from '../../config'
import User from '../models/user'

const currentUser = async (req, res, next) => {
  const {authorization} = req.headers
  if (authorization) {
    const [name, token] = authorization.split(' ')
    if (name !== 'Bearer') {
      next()
      return
    }

    const {id} = jwt.verify(token, appSecret)
	
	
    if (!id) {
      next()
      return
    }

    const currentUser = await new User({id}).fetch()

    if (!currentUser) {
      next()
      return
    }

    req.currentUser = currentUser.serialize()
	next()
  } else if((req.url.includes("api/users") || req.url.includes("api/around")) && (req.url !== "/api/users") && (req.url !== "/api/users/forgot") &&(req.url !== "/api/users/reset")){
	  res.status(400).end()
	  return
  } else {
  next()
  }
}

export default currentUser
