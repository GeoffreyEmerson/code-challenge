const express = require('express')
const router = express.Router()

const Order = require('../models/order')
const bodyparser = require('body-parser')
const jsonParser = bodyparser.json()

module.exports = router

.get('/', (req, res, next) => {
  Order.find()
  .then(orders => res.send(orders))
  .catch(next)
})

.post('/', jsonParser, (req, res, next) => {
  new Order(req.body)
  .save()
  .then(savedOrder => res.send(savedOrder))
  .catch(err => {
    const readableError = {
      message: err.message,
      errors: Object.keys(err.errors).map(key => err.errors[key].message)
    }
    next(readableError)
  })
})
