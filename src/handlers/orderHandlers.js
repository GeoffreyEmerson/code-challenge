const Order = require('../models/order')
const suppliers = require('../requests/suppliers')

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('externalRequests')
    res.send(orders)
  } catch (err) {
    next(err)
  }
}

const postOrder = async (req, res, next) => {
  try {
    const savedOrder = await new Order(req.body).save()
    const orderPrepared = await suppliers.prepareExternalOrders(savedOrder)
    // Note that the following line begins the process of calling external APIs,
    //  but does not wait for them to resolve. Waiting for external API calls to
    //  resolve would likely introduce unwanted delay and is not necessary.
    suppliers.executeExternalOrders(orderPrepared)
    res.send({status: 'success', order: orderPrepared._id})
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getOrders,
  postOrder
}
