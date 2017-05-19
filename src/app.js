const express = require('express')
const bodyparser = require('body-parser')

const orderHandlers = require('./handlers/orderHandlers')
const errorHandler = require('./error-handler')

const jsonParser = bodyparser.json()

const app = express()

app
.get('/api/healthcheck', (req, res) => res.send({status: 'ok'}))
.get('/api/orders', orderHandlers.getOrders)
.post('/api/order', jsonParser, orderHandlers.postOrder)
.use(errorHandler)

module.exports = app
