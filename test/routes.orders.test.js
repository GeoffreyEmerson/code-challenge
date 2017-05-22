const database = require('../src/database')
const chai = require('chai')
const request = require('superagent')
const app = require('../src/app')
const mockServers = require('./mock.external-api')
const Customer = require('../src/models/customer')
const User = require('../src/models/user')

const assert = chai.assert

const port = process.env.PORT || 3000
let server, acmeServer, rainerServer
let testToken, unauthorizedUserToken
const testRunner = {username: 'test-runner', password: 'testing', email: 'email@mail.com', approved: true}
const unauthorizedUser = {username: 'not-yet-auth', password: 'randompass', email: 'other@mail.com', approved: false}
const testOrder = {make: 'Tesla', model: 'Model S', package: 'std'}
const testOrder2 = {make: 'Honda', model: 'Civic', package: 'silver'}
const testOrder3 = {make: 'Honda', model: 'Civic', package: 'gold'}
const badOrder = {make: 'Lamborghini', model: 'Centenario', package: ''}
const testCustomer = { name: 'Sally', address: '1234 Any St.', city: 'Eugene', state: 'OR', zip: '97401', country: 'USA' }

describe('orders endpoint', () => {
  before(done => {
    database.startMock(done)
  })

  before(async () => {
    const customer = await new Customer(testCustomer).save()
    testOrder.customer_id = customer._id
    testOrder2.customer_id = customer._id
    testOrder3.customer_id = customer._id

    await Promise.all([
      server = app.listen(port),
      acmeServer = mockServers.acme.listen(3050),
      rainerServer = mockServers.rainer.listen(3051)
    ])

    // We need to set up users for testing purposes.
    const simulatedExistingUser = new User(testRunner)
    const simulatedUnauthorizedUser = new User(unauthorizedUser)
    await Promise.all([simulatedExistingUser.save(), simulatedUnauthorizedUser.save()])
    // The auth route is tested in another file. Here we just need it
    //  to give us tokens to test the order routes.
    let response = await request
    .post(`localhost:${port}/api/auth`)
    .send({email: testRunner.email, password: testRunner.password})
    testToken = response.body.userToken
    response = await request
    .post(`localhost:${port}/api/auth`)
    .send({email: unauthorizedUser.email, password: unauthorizedUser.password})
    unauthorizedUserToken = response.body.userToken
  })

  after(async () => {
    await Promise.all([
      server.close(),
      acmeServer.close(),
      rainerServer.close()
    ])
  })

  it('checks for user authorization on GET route', async () => {
    const result = await request
    .get(`localhost:${port}/api/orders`)
    .set('token', testToken)
    assert.equal(result.statusCode, 200)
    assert.include(result.header['content-type'], 'application/json')
    assert.deepEqual([], result.body)
  })

  it('returns error for unauthorized user on GET route', async () => {
    try {
      const result = await request
      .get(`localhost:${port}/api/orders`)
      .set('token', unauthorizedUserToken)
      assert.notOk(result)
    } catch (err) {
      assert.ok(err)
      assert.equal(err.response.statusCode, 400)
      assert.include(err.response.header['content-type'], 'application/json')
      assert.equal(err.response.body.error, 'user not approved, please contact admin')
    }
  })

  it('returns indicator of success on well-formed POST to orders route', async () => {
    try {
      const result = await request
      .post(`localhost:${port}/api/order`)
      .set('token', testToken)
      .send(testOrder)
      assert.include(result.header['content-type'], 'application/json')
      const response = result.body
      assert.equal(response.status, 'success')
      assert.ok(response.order)
    } catch (err) {
      console.log('error', err)
      assert.notOk(err)
    }
  })

  it('returns error on poorly formed POST to orders route', async () => {
    try {
      const result = await request
      .post(`localhost:${port}/api/order`)
      .set('token', testToken)
      .send(badOrder)
      assert.notOk(result)
    } catch (err) {
      assert.equal(err.status, 400)
      const errorObject = err.response.body
      assert.equal(errorObject.message, 'Order validation failed')
      assert.equal(errorObject.errors.customer_id.message, 'Path `customer_id` is required.')
      assert.equal(errorObject.errors.package.message, 'Package must be "std", "silver", or "gold".')
    }
  })

  it('returns list of saved orders from database on GET to orders route', async () => {
    await new Promise(resolve => setTimeout(resolve, 50))
    try {
      const result = await request
      .get(`localhost:${port}/api/orders`)
      .set('token', testToken)
      assert.equal(result.statusCode, 200)
      assert.include(result.header['content-type'], 'application/json')
      const orderList = result.body
      assert.equal(orderList.length, 1)
      Object.keys(testOrder).forEach(key => assert.equal(testOrder[key], orderList[0][key]))
    } catch (err) {
      console.log('error', err)
      assert.notOk(err)
    }
  })

  it('makes external requests when a new internal order is posted', async () => {
    try {
      await request
      .post(`localhost:${port}/api/order`)
      .set('token', testToken)
      .send(testOrder2)
      // Here we're testing the resolved simulated external API calls,
      //  so we need to give it a few milliseconds to finish before we
      //  do a fetch
      await new Promise(resolve => setTimeout(resolve, 50))
      const result = await request
      .get(`localhost:${port}/api/orders`)
      .set('token', testToken)
      result.body.forEach(order => {
        // get package type and check for matching external parts request
        order.externalRequests.forEach(request => {
          if (request.company === 'ACME') {
            switch (order.package) {
              case 'std':
                assert.equal(request.pending, false)
                assert.equal(request.parameters.model, 'anvil')
                assert.equal(request.parameters.package, 'std')
                break
              case 'silver':
                assert.equal(request.pending, false)
                assert.equal(request.parameters.model, 'wile')
                assert.equal(request.parameters.package, 'super')
                break
              case 'gold':
                assert.equal(request.pending, false)
                assert.equal(request.parameters.model, 'roadrunner')
                assert.equal(request.parameters.package, 'elite')
                break
            }
          } else if (request.company === 'Ranier') {
            switch (order.package) {
              case 'std':
                assert.equal(request.pending, false)
                assert.equal(request.parameters.model, 'pugetsound')
                assert.equal(request.parameters.custom, 'mtn')
                break
              case 'silver':
                assert.equal(request.pending, false)
                assert.equal(request.parameters.model, 'olympic')
                assert.equal(request.parameters.custom, 'ltd')
                break
              case 'gold':
                assert.equal(request.pending, false)
                assert.equal(request.parameters.model, 'olympic')
                assert.equal(request.parameters.custom, '14k')
                break
            }
          }
        })
      })
    } catch (err) {
      console.log('err:', err)
      assert.notOk(err)
    }
  })
})
