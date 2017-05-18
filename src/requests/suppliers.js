const request = require('superagent')

const ExternalRequest = require('../models/request')
const Order = require('../models/order')

const suppliers = {
  placeOrders: referenceOrder => {
    placeAcmeOrder(referenceOrder)
    placeRainerOrder(referenceOrder)
  }
}

module.exports = suppliers

const placeAcmeOrder = referenceOrder => {
  defineAcmeRequest(referenceOrder)
  .save()
  .then(saveReferenceInParentOrder)
  .then(makeAcmeApiCall)
  .then(saveResultOfExternalApiCall)
  .catch(logApiError)
}

const placeRainerOrder = referenceOrder => {
  defineRanierRequest(referenceOrder)
  .save()
  .then(saveReferenceInParentOrder)
  .then(makeRanierApiCall)
  .then(saveResultOfExternalApiCall)
  .catch(logApiError)
}

const defineAcmeRequest = referenceOrder => {
  return new ExternalRequest({
    parentOrder: referenceOrder._id,
    company: 'ACME',
    url: 'http://localhost:3050/acme/api/v45.1',
    // TODO: calculate parameters from make and model in the original order
    parameters: {
      api_key: 'cascade.53bce4f1dfa0fe8e7ca126f91b35d3a6',
      model: 'anvil',
      package: 'std'
    }
  })
}

const defineRanierRequest = referenceOrder => {
  return new ExternalRequest({
    parentOrder: referenceOrder._id,
    company: 'Rainer',
    url: 'http://localhost:3051/r',
    // TODO: calculate parameters from make and model in the original order
    parameters: {
      model: 'pugetsound',
      custom: 'mtn'
    }
  })
}

const saveReferenceInParentOrder = externalRequest => {
  Order.findByIdAndUpdate(
    externalRequest.parentOrder._id,
    {$push: {externalRequests: externalRequest}},
    {upsert: true, new: true}
  )
  // We actually don't need to wait on the result of the above update, so we can move on
  return Promise.resolve(externalRequest)
}

const makeAcmeApiCall = acmeRequest => {
  return Promise.all([
    request.post(acmeRequest.url + '/order').type('form').send(acmeRequest.parameters),
    Promise.resolve(acmeRequest)
  ])
}

const makeRanierApiCall = ranierRequest => {
  return request
  .get(ranierRequest.url + '/nonce_token')
  .type('form')
  .send({storefront: 'ccas­bb9630c04f'})
  .then(result => {
    ranierRequest.parameters.token = result.body.nonce_token
    return Promise.all([
      request
      .post(ranierRequest.url + '/request_customized_model')
      .type('form')
      .send(ranierRequest.parameters),
      Promise.resolve(ranierRequest)
    ])
  })
}

const saveResultOfExternalApiCall = ([result, externalRequest]) => {
  externalRequest.pending = false
  externalRequest.response = result.body
  return externalRequest.save()
}

const logApiError = err => {
  console.log('error processing externalRequest:', err)
}
