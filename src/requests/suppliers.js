// Overview of process included in this file:
//
// The two exposed methods are:
//  - prepareExternalOrders
//  - executeExternalOrders
//
// prepareExternalOrders will perform the following steps for each external API:
//  - Create a customized Mongoose document
//  - Save the document
//  - Save a reference in the parent Order document
//  - Return the parent Order document including the new references
//
// executeExternalOrders will perform the following steps for each reference:
//  - Determine which external API to call
//  - Perform the API call according to the procedure of the API
//  - Save the response in the individual reference document
//  - Return the completed parent document

const request = require('superagent')

const ExternalRequest = require('../models/request')
const Order = require('../models/order')

const prepareExternalOrders = async referenceOrder => {
  await prepareAcmeOrder(referenceOrder)
  return prepareRainerOrder(referenceOrder)
}

const executeExternalOrders = async referenceOrder => {
  await Promise.all(referenceOrder.externalRequests.map(externalRequest => {
    if (externalRequest.company === 'ACME') {
      return executeAcmeOrder(externalRequest)
    } else if (externalRequest.company === 'Rainer') {
      return executeRanierOrder(externalRequest)
    } else {
      Promise.resolve()
    }
  }))
  return Order.findOne({_id: referenceOrder._id}).populate('externalRequests')
}

module.exports = {
  prepareExternalOrders,
  executeExternalOrders
}

const prepareAcmeOrder = async referenceOrder => {
  try {
    const acmeRequestUnsaved = defineAcmeRequest(referenceOrder)
    const acmeRequestMongoDoc = await acmeRequestUnsaved.save()
    return saveReferenceInParentOrder(acmeRequestMongoDoc)
  } catch (error) {
    logApiCallError(error)
  }
}

const executeAcmeOrder = async externalRequest => {
  try {
    const apiCallResult = await makeAcmeApiCall(externalRequest)
    return saveResultOfExternalApiCall(apiCallResult, externalRequest)
  } catch (error) {
    logApiCallError(error)
  }
}

const prepareRainerOrder = async referenceOrder => {
  try {
    const ranierRequestUnsaved = defineRanierRequest(referenceOrder)
    const ranierRequestMongoDoc = await ranierRequestUnsaved.save()
    return saveReferenceInParentOrder(ranierRequestMongoDoc)
  } catch (error) {
    logApiCallError(error)
  }
}

const executeRanierOrder = async externalRequest => {
  try {
    const apiCallResult = await makeRanierApiCall(externalRequest)
    return saveResultOfExternalApiCall(apiCallResult, externalRequest)
  } catch (error) {
    logApiCallError(error)
  }
}

const defineAcmeRequest = referenceOrder => {
  let model, package
  switch (referenceOrder.package) {
    case 'std':
      model = 'anvil'
      package = 'std'
      break
    case 'silver':
      model = 'wile'
      package = 'super'
      break
    case 'gold':
      model = 'roadrunner'
      package = 'elite'
      break
  }
  return new ExternalRequest({
    parentOrder: referenceOrder._id,
    company: 'ACME',
    url: 'http://localhost:3050/acme/api/v45.1',
    // TODO: calculate parameters from make and model in the original order
    parameters: {
      api_key: 'cascade.53bce4f1dfa0fe8e7ca126f91b35d3a6',
      model,
      package
    }
  })
}

const defineRanierRequest = referenceOrder => {
  switch (referenceOrder.package) {
    case 'std':
      model = 'pugetsound'
      custom = 'mtn'
      break
    case 'silver':
      model = 'olympic'
      custom = 'ltd'
      break
    case 'gold':
      model = 'olympic'
      custom = '14k'
      break
  }
  return new ExternalRequest({
    parentOrder: referenceOrder._id,
    company: 'Rainer',
    url: 'http://localhost:3051/r',
    // TODO: calculate parameters from make and model in the original order
    parameters: {
      model,
      custom
    }
  })
}

const saveReferenceInParentOrder = async externalRequest => {
  return Order.findByIdAndUpdate(
    externalRequest.parentOrder,
    {$push: {externalRequests: externalRequest}},
    {upsert: true, new: true}
  )
  .populate('externalRequests')
  .catch(err => {
    console.log('error saving external request:', err)
  })
}

const makeAcmeApiCall = async acmeRequest => {
  return request
  .post(acmeRequest.url + '/order')
  .type('form')
  .send(acmeRequest.parameters)
}

const makeRanierApiCall = async ranierRequest => {
  return request
  .get(ranierRequest.url + '/nonce_token')
  .type('form')
  .send({storefront: 'ccas­-bb9630c04f'})
  .then(result => {
    ranierRequest.parameters.token = result.body.nonce_token
    return request
    .post(ranierRequest.url + '/request_customized_model')
    .type('form')
    .send(ranierRequest.parameters)
  })
}

const saveResultOfExternalApiCall = async (result, externalRequest) => {
  externalRequest.pending = false
  externalRequest.response = result.body
  return externalRequest.save()
}

const logApiCallError = err => {
  console.log('error processing externalRequest:', err)
}
