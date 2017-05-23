const database = require('../src/database')
const chai = require('chai')
const request = require('superagent')
const app = require('../src/app')
const mockServers = require('./mock.external-api')
const User = require('../src/models/user')

const assert = chai.assert

const port = process.env.PORT || 3000
let server, acmeServer, rainerServer
let testToken, unauthorizedUserToken
const testRunner = {username: 'test-runner2', password: 'testing', email: 'email2@mail.com', approved: true}
const unauthorizedUser = {username: 'not-yet-auth1', password: 'randompass', email: 'other1@mail.com', approved: false}
const testCustomer = { name: 'Larry', address: '1234 Any St.', city: 'Eugene', state: 'OR', zip: '97401', country: 'USA' }
const noNameCustomer = { name: '', address: '1234 Any St.', city: 'Eugene', state: 'OR', zip: '97401', country: 'USA' }

describe('customers endpoint', () => {
  before(done => {
    database.startMock(done)
  })

  after(done => {
    database.stop(done)
  })

  before(async () => {
    try {
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
      .post(`localhost:${port}/api/auth/login`)
      .send({email: testRunner.email, password: testRunner.password})
      testToken = response.body.userToken
      response = await request
      .post(`localhost:${port}/api/auth/login`)
      .send({email: unauthorizedUser.email, password: unauthorizedUser.password})
      unauthorizedUserToken = response.body.userToken
    } catch (err) {
      console.log('Problem preparing for tests in customers endpoint before all')
      console.log('err:', err)
    }
  })

  after(async () => {
    await Promise.all([
      server.close(),
      acmeServer.close(),
      rainerServer.close()
    ])
  })

  it('returns error on unauthorized POST to customer route', async () => {
    try {
      const result = await request
      .post(`localhost:${port}/api/customers`)
      .set('token', unauthorizedUserToken)
      .send(testCustomer)
      assert.notOk(result)
    } catch (err) {
      assert.equal(err.status, 400)
      const errorObject = err.response.body
      assert.equal(errorObject.code, 403)
      assert.equal(errorObject.error, 'user not approved, please contact admin')
    }
  })

  it('returns error on POST to customer route with missing field data', async () => {
    try {
      const result = await request
      .post(`localhost:${port}/api/customers`)
      .set('token', testToken)
      .send(noNameCustomer)
      assert.equal(result.body.status, 'fail')
      assert.equal(result.body.error, 'Creating a customer requires name, address, city, state, zip, and country.')
    } catch (err) {
      throw err
    }
  })

  it('returns success on POST to customer route with complete data', async () => {
    try {
      const result = await request
      .post(`localhost:${port}/api/customers`)
      .set('token', testToken)
      .send(testCustomer)
      assert.notOk(result.body.error)
      assert.equal(result.body.status, 'success')
      assert.ok(result.body.customer)
      assert.ok(result.body.customer._id)
    } catch (err) {
      throw err
    }
  })

  it('checks for user authorization on GET customers route', async () => {
    try {
      const result = await request
      .get(`localhost:${port}/api/customers`)
      .set('token', unauthorizedUserToken)
      assert.notOk(result.body)
    } catch (err) {
      assert.equal(err.status, 400)
      const errorObject = err.response.body
      assert.equal(errorObject.code, 403)
      assert.equal(errorObject.error, 'user not approved, please contact admin')
    }
  })

  it('returns customer list from GET on customers route', async () => {
    try {
      const result = await request
      .get(`localhost:${port}/api/customers`)
      .set('token', testToken)
      assert.equal(result.statusCode, 200)
      assert.include(result.header['content-type'], 'application/json')
      assert.ok(result.body)
    } catch (err) {
      throw err
    }
  })
})
