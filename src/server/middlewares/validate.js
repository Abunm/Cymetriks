import isPromise from 'is-promise'

const validate = (...validators) => async (req, res, next) => {
  for (const validator of validators) {
    const invalid = isPromise(validator) ?
      (await validator(req, res)) :
      validator(req, res)
    if (invalid) {
      res.status(400).json(invalid)
      return
    }
  }

  next()
}

export default validate
