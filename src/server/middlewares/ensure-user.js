const ensureUser = (req, res, next) => {
  if (req.currentUser) {
    next()
  } else {
    res.status(401).end()
  }
}

export default ensureUser

