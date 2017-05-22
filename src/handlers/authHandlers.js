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

const checkAuth = async (req, res, next) => {
  const userToken = req.headers.token

  if (!userToken) {
    return next({
      code: 400,
      error: 'unauthorized, no token provided'
    })
  }

  try {
    const payload = await token.verify(userToken)
    // for valid token, attach payload to req
    req.user = payload
  } catch (err) {
    return next({
      code: 403,
      error: 'unauthorized, invalid token'
    })
  }

  // If a user has been downgraded from high security to low security,
  //  we don't want an older token accidentally giving them access to
  //  their previous level. Checking the current 'role' will avoid such
  //  potential problems.
  let foundUser
  try {
    foundUser = await User.findById(req.user.id)
  } catch (err) {
    return next({
      code: 403,
      error: 'unauthorized, user not found'
    })
  }

  if (!foundUser.approved) {
    return next({
      code: 403,
      error: 'user not approved, please contact admin'
    })
  }

  req.user.role = foundUser.role
  next()
}

module.exports = {
  login,
  checkAuth
}
