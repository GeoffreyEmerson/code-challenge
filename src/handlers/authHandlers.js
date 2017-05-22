const User = require('../models/user')
const token = require('../auth/token')

const login = async (req, res, next) => {
  const {email, password} = req.body
  if (!email || !password) {
    return res.send({status: 'fail', message: 'Both email and password are required'})
  }

  try {
    const foundUser = await User.findOne({email})
    const confirmed = await foundUser.comparePassword(password)
    if (confirmed) {
      const userToken = await token.create(foundUser)
      res.send({status: 'success', userToken})
    } else {
      sendFail(res)
    }
  } catch (err) {
    sendFail(res)
  }
}

const sendFail = res => {
  res.send({status: 'fail', message: 'There was a problem with your email and/or password.'})
}

module.exports = {
  login
}
