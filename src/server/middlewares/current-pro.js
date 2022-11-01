import jwt from 'jsonwebtoken'

import {appSecret} from '../../config'
import Pro from '../models/pro'

const currentPro = async (req, res, next) => {
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

    const currentPro = await new Pro({id}).fetch()

    if (!currentPro) {
      next()
      return
    }

    req.currentPro = currentPro.serialize()
  }
  next()
}

export default currentPro
