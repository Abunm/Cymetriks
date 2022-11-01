const passwordMatch = req => {
  const {password, confirmPassword} = req.body
  if (password === confirmPassword) {
    return null
  } else {
    return [
      {
        message: 'password does not match',
        path: 'confirmPassword',
      },
    ]
  }
}

export default passwordMatch
