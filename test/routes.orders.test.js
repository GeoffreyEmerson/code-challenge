const database = require('../src/database')
const chai = require('chai')
const request = require('superagent')
const app = require('../src/app')
const mockServers = require('./mock.external-api')

const assert = chai.assert

const port = process.env.PORT || 3000
let server, acmeServer, rainerServer

const testOrder = {make: 'Tesla', model: 'Model S', package: 'P100D', customer_id: '1'}
const testOrder2 = {make: 'Honda', model: 'Civic', package: 'Standard', customer_id: '2'}
const badOrder = {make: 'Lamborghini', model: 'Centenario', package: '', customer_id: ''}

describe('orders endpoint', () => {
  before(done => {
    database.startMock(done)
  })

  before(done => {
    server = app.listen(port, () => {
      acmeServer = mockServers.acme.listen(3050, () => {
        rainerServer = mockServers.rainer.listen(3051, done)
      })
    })
  })

  after(done => {
    server.close(() => {
      acmeServer.close(() => {
        rainerServer.close(done)
      })
    })
  })

  it('returns indicator of success on well-formed POST to orders route', done => {
    request
    .post(`localhost:${port}/api/order`)
    .send(testOrder)
    .end((err, res) => {
      if (err) done(err)
      assert.equal(res.statusCode, 200)
      assert.include(res.header['content-type'], 'application/json')
      const response = res.body
      assert.equal(response.status, 'success')
      assert.ok(response.order)
      done()
    })
  })

  it('returns error on poorly formed POST to orders route', done => {
    request
    .post(`localhost:${port}/api/order`)
    .send(badOrder)
    .end((err, res) => {
      assert.equal(err.status, 400)
      const errorObject = err.response.body
      assert.equal(errorObject.message, 'Order validation failed')
      assert.equal(errorObject.errors.customer_id.message, 'Path `customer_id` is required.')
      assert.equal(errorObject.errors.package.message, 'Path `package` is required.')
      done()
    })
  })

  it('returns list of saved orders from database on GET to orders route', done => {
    setTimeout(() => {
      request
      .get(`localhost:${port}/api/orders`)
      .end((err, res) => {
        if (err) done(err)
        assert.equal(res.statusCode, 200)
        assert.include(res.header['content-type'], 'application/json')
        const orderList = res.body
        assert.equal(orderList.length, 1)
        Object.keys(testOrder).forEach(key => assert.equal(testOrder[key], orderList[0][key]))
        done()
      })
    }, 50)
  })

  it('makes external requests when a new internal order is posted', done => {
    request
    .post(`localhost:${port}/api/order`)
    .send(testOrder2)
    .then(res => {
      setTimeout(() => {
        request.get(`localhost:${port}/api/orders`)
        .then(res => {
          res.body.forEach(order => {
            order.externalRequests.forEach(request => {
              assert.equal(request.pending, false)
            })
          })
          done()
        })
        .catch(done)
      }, 25)
    })
    .catch(done)
  })
})
