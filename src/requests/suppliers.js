const request = require('superagent')

const ExternalRequest = require('../models/request')
const Order = require('../models/order')

const suppliers = {
  placeOrders: referenceOrder => {
    placeAcmeOrder(referenceOrder)
    placeRainerOrder(referenceOrder)
  }
}

const placeAcmeOrder = referenceOrder => {
  const internalOrderId = referenceOrder._id
  let externalRequestId
  let acmeRequest = new ExternalRequest({
    parentOrder: internalOrderId,
    company: 'ACME',
    url: 'http://localhost:3050/acme/api/v45.1',
    // TODO: calculate parameters from make and model in the original order
    parameters: {
      api_key: 'cascade.53bce4f1dfa0fe8e7ca126f91b35d3a6',
      model: 'anvil',
      package: 'std'
    }
  })
  acmeRequest.save()
  .then(savedRequest => {
    externalRequestId = savedRequest._id
    acmeRequest = savedRequest
    return Order.findByIdAndUpdate(internalOrderId, {$push: {externalRequests: savedRequest}}, {upsert: true, new: true})
  })
  .then(updatedOrder => {
    console.log('updatedOrder', updatedOrder)
    return request
    .post(acmeRequest.url)
    .set('content-type', 'x­-www­-form­-urlencoded')
    .send(JSON.stringify(acmeRequest.parameters))
  })
  .then(res => {
    // if (err) throw err
    // acmeRequest.pending = false
    // savedRequest.response =
    console.log('acmeRequest', res.body)
    // return acmeRequest.save()
  // })
  // .then(updatedOrder => {
  //   console.log('updatedOrder:', updatedOrder)
    // execute external API request
  })
  .catch(err => {
    console.log('error saving acmeRequest:', err)
  })
}

const placeRainerOrder = referenceOrder => {
  const internalOrderId = referenceOrder._id
  let externalRequestId
  const rainerRequest = new ExternalRequest({
    parentOrder: internalOrderId,
    company: 'Rainer',
    url: 'http://localhost:3051/r',
    // TODO: calculate parameters from make and model in the original order
    parameters: {
      storefront: 'ccas­bb9630c04f'
    }
  })
  rainerRequest.save()
  .then(savedRequest => {
    externalRequestId = savedRequest._id
    return Order.findByIdAndUpdate(internalOrderId, {$push: {externalRequests: savedRequest}}, {upsert: true, new: true})
  })
  .then(updatedOrder => {
    console.log('updatedOrder:', updatedOrder)
    // simulate nonce_token interaction
  })
  .catch(err => {
    console.log('error saving rainerRequest:', err)
  })
}

module.exports = suppliers
