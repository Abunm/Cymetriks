const ensureAdmin = (req, res, next) => {
  if (req.currentPro && req.currentPro.email === 'admin@admin.com') {
    next()
  } else {
    res.status(401).end()
  }
}

export default ensureAdmin
