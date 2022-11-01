const ensurePro = (req, res, next) => {
  if (req.currentPro && req.currentPro.validated) {
    next()
  } else {
    res.status(401).end()
  }
}

export default ensurePro
