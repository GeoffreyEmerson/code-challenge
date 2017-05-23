const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')

const orderHandlers = require('./handlers/orderHandlers')
const authHandlers = require('./handlers/authHandlers')
const customersRoutes = require('./routers/customers')
const authRoutes = require('./routers/auth')
const errorHandler = require('./error-handler')
const fourOhFour = require('./fourohfour')

const jsonParser = bodyparser.json()

const app = express()

app
.use(cors()) // cors can be locked down here as necessary
.get('/api/healthcheck', (req, res) => res.send({status: 'ok'}))
.get('/api/orders', authHandlers.checkAuth, orderHandlers.getOrders)
.post('/api/order', jsonParser, authHandlers.checkAuth, orderHandlers.postOrder)
.use('/api/customers', jsonParser, authHandlers.checkAuth, customersRoutes)
.use('/api/auth', jsonParser, authRoutes)
.use(errorHandler)
.use(fourOhFour)

module.exports = app
