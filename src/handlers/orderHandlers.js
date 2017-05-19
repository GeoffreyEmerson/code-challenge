const Order = require('../models/order')
const suppliers = require('../requests/suppliers')

const getOrders = (req, res, next) => {
  Order.find().populate('externalRequests')
  .then(orders => res.send(orders))
  .catch(next)
}

const postOrder = (req, res, next) => {
  new Order(req.body)
  .save()
  .then(async savedOrder => {
    const orderWithExternalCallsPrepared = await suppliers.prepareExternalOrders(savedOrder)
    const orderWithExternalCallsResolved = await suppliers.executeExternalOrders(orderWithExternalCallsPrepared)
    res.send(orderWithExternalCallsResolved)
  })
  .catch(err => {
    const simplifiedError = {
      message: err.message,
      errors: Object.keys(err.errors).map(key => err.errors[key].message)
    }
    next(simplifiedError)
  })
}

module.exports = {getOrders, postOrder}
