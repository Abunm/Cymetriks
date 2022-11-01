import Joi from 'joi'

const respectSchema = schema => req => {
  const {error} = Joi.validate(req.body, schema)
  if (error) {
    return error.details
  } else {
    return null
  }
}

export default respectSchema
