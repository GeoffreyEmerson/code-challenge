const express = require('express')
const app = express()

const orders = require('./routes/orders')
const errorHandler = require('./error-handler')

module.exports = app
.get('/api/healthcheck', (req, res) => res.send({status: 'ok'}))
.use('/api/orders', orders)
.use(errorHandler)
