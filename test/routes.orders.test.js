const database = require('../src/database')
const chai = require('chai')
const request = require('superagent')
const app = require('../src/app')
const mockServers = require('./mock.external-api')

const assert = chai.assert

const port = process.env.PORT || 3000
let server, acmeServer, rainerServer

const testOrder = {make: 'Tesla', model: 'Model S', package: 'std', customer_id: '1'}
const testOrder2 = {make: 'Honda', model: 'Civic', package: 'silver', customer_id: '2'}
const testOrder3 = {make: 'Honda', model: 'Civic', package: 'gold', customer_id: '3'}
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
      assert.equal(errorObject.errors.package.message, 'Package must be "std", "silver", or "gold".')
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
          done()
        })
        .catch(done)
      }, 25)
    })
    .catch(done)
  })
})
