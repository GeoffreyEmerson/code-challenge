const express = require('express')
const bodyparser = require('body-parser')

const Order = require('../models/order')
const suppliers = require('../requests/suppliers')

const router = express.Router()
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
  .then(savedOrder => {
    suppliers.placeOrders(savedOrder)
    res.send(savedOrder)
  })
  .catch(err => {
    const readableError = {
      message: err.message,
      errors: Object.keys(err.errors).map(key => err.errors[key].message)
    }
    next(readableError)
  })
})
