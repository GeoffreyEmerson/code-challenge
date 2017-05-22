const jwt = require('jsonwebtoken')
const secret = process.env.APP_SECRET || 'secret_phrase_or_whatever'

const create = user => {
  return new Promise((resolve, reject) => {
    const payload = { id: user._id, username: user.username, email: user.email }
    jwt.sign(payload, secret, null, (err, token) => {
      if (err) return reject(err)
      resolve(token)
    })
  })
}

const verify = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) return reject(err)
      resolve(payload) // verified and return payload object
    })
  })
}

module.exports = {
  create,
  verify
}
