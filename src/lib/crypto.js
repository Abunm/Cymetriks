import bcrypt from 'bcryptjs'

const saltRounds = 12

export const hash = password => new Promise((resolve, reject) => {
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      reject(err)
    } else {
      resolve(hash)
    }
  })
})

export const compare = (password, hash) => new Promise((resolve, reject) => {
  bcrypt.compare(password, hash, (err, status) => {
    if (err) {
      reject(err)
    } else {
      resolve(status)
    }
  })
})
