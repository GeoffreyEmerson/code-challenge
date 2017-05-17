const database = require('../src/database')
const chai = require('chai')
const request = require('superagent')
const app = require('../src/app')

const assert = chai.assert

const port = process.env.PORT || 3000
let server

const testOrder = {make: 'Tesla', model: 'Model S', package: 'P100D', customer_id: '1'}
const badOrder = {make: 'Lamborghini', model: 'Centenario', package: '', customer_id: ''}

describe('orders endpoint', () => {
  before(done => {
    database.startMock(done)
  })

  before(done => {
    server = app.listen(port, done)
  })

  after(done => {
    server.close(done)
  })

  it('returns order data on successful POST to orders route', done => {
    request
    .post(`localhost:${port}/api/orders`)
    .send(testOrder)
    .end((err, res) => {
      if (err) done(err)
      assert.equal(res.statusCode, 200)
      assert.include(res.header['content-type'], 'application/json')
      const order = JSON.parse(res.text)
      // Since Mongo adds data to the object, the simplest way of testing equality
      //  is to cycle through the original object's keys and check that they
      //  made it into the saved document.
      Object.keys(testOrder).forEach(key => assert.equal(testOrder[key], order[key]))
      done()
    })
  })

  it('returns error on poorly formed POST to orders route', done => {
    request
    .post(`localhost:${port}/api/orders`)
    .send(badOrder)
    .end((err, res) => {
      assert.equal(err.status, 400)
      const errorObject = err.response.body
      assert.equal(errorObject.message, 'Order validation failed')
      assert.deepEqual(errorObject.errors, [ 'Path `customer_id` is required.', 'Path `package` is required.' ])
      done()
    })
  })

  it('returns list of saved orders from database on GET to orders route', done => {
    request
    .get(`localhost:${port}/api/orders`)
    .end((err, res) => {
      if (err) done(err)
      assert.equal(res.statusCode, 200)
      assert.include(res.header['content-type'], 'application/json')
      const orderList = JSON.parse(res.text)
      assert.equal(orderList.length, 1)
      Object.keys(testOrder).forEach(key => assert.equal(testOrder[key], orderList[0][key]))
      done()
    })
  })
})
