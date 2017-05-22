const router = require('express').Router()
const authHandlers = require('../handlers/authHandlers')

router
.post('/login', authHandlers.login)
.post('/signup', authHandlers.signup)

module.exports = router
