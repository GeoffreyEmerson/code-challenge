const express = require('express')
const bodyparser = require('body-parser')

const authHandlers = require('./handlers/authHandlers')
const orderHandlers = require('./handlers/orderHandlers')
const errorHandler = require('./error-handler')

const jsonParser = bodyparser.json()
// const checkAuth = authHandlers.getCheckAuth()

const app = express()

app
.get('/api/healthcheck', (req, res) => res.send({status: 'ok'}))
.get('/api/orders', authHandlers.checkAuth, orderHandlers.getOrders)
.post('/api/order', jsonParser, authHandlers.checkAuth, orderHandlers.postOrder)
.post('/api/auth', jsonParser, authHandlers.login)
.use(errorHandler)

module.exports = app
