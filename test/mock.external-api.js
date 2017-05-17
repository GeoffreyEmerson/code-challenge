const express = require('express')
const acme = express()
const rainer = express()

const errorHandler = require('../src/error-handler')

acme
.post('/acme/api/v45.1', (req, res) => res.send({status: 'ok'}))
.use(errorHandler)

rainer
.post('/acme/api/v45.1', (req, res) => res.send({status: 'ok'}))
.use(errorHandler)

module.exports = {acme, rainer}
