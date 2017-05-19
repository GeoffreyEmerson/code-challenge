const express = require('express')
const bodyParser = require('body-parser')
const errorHandler = require('../src/error-handler')

const acme = express()
const rainer = express()

acme
.use(bodyParser.urlencoded({ extended: false }))
.post('/acme/api/v45.1/order', acmeHandler)
.use(errorHandler)

rainer
.use(bodyParser.urlencoded({ extended: false }))
.get('/r/nonce_token', rainerTokenHandler)
.post('/r/request_customized_model', rainerHandler)
.use(errorHandler)

module.exports = {acme, rainer}

function acmeHandler (req, res, next) {
  const {api_key, model, package} = req.body
  if (req.body && api_key && model && package &&
    api_key === 'cascade.53bce4f1dfa0fe8e7ca126f91b35d3a6'
    && ( (model === 'anvil') || (model === 'wile') || (model === 'roadrunner') )
    && ( (package === 'std') || (package === 'super') || (package === 'elite') )
  ) {
    const simulatedOrderNumber = Math.floor(Math.random() * 10000)
    res.send({order: simulatedOrderNumber})
  } else {
    res.send({error: 'Bad request', parameters: req.body})
  }
}

function rainerTokenHandler (req, res, next) {
  if (req.body && req.body.storefront === 'ccas­-bb9630c04f') {
    res.send({nonce_token: 'ff6bfd673ab6ae03d8911'})
  } else {
    res.send({error: 'Bad Request, expected storefront id', parameters: req.body})
  }
}

function rainerHandler (req, res, next) {
  const {token, model, custom} = req.body
  if (req.body && token && model && custom &&
    token === 'ff6bfd673ab6ae03d8911'
    && ( (model === 'pugetsound') || (model === 'olympic') )
    && ( (custom === 'mtn') || (custom === 'ltd') || (custom === '14k') )
  ) {
    const simulatedOrderNumber = Math.floor(Math.random() * 1000)
    res.send({order_id: simulatedOrderNumber})
  } else {
    res.send({error: 'Bad request', parameters: req.body})
  }
}
