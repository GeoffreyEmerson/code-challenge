const express = require('express')
const bodyParser = require('body-parser')
const errorHandler = require('../src/error-handler')

const acme = express()
const rainer = express()

acme
.use(bodyParser.urlencoded({ extended: false }))
.post('/acme/api/v45.1', acmeHandler)
.use(errorHandler)

rainer
.post('/acme/api/v45.1', rainerHandler)
.use(errorHandler)

module.exports = {acme, rainer}

function acmeHandler (req, res, next) {
  console.log('acme POST recieved:', req.body)
  res.send({status: 'ok'})
}

function rainerHandler (req, res, next) {
  console.log('rainer POST recieved:', req.body)
  res.send({status: 'ok'})
}
