const router = require('express').Router()
const customerHandlers = require('../handlers/customerHandlers')

router
.get('/', customerHandlers.get)
.post('/', customerHandlers.post)

module.exports = router
