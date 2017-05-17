const database = require('../src/database')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/app')

const assert = chai.assert
chai.use(chaiHttp)
const request = chai.request(app)

const testOrder = {make: 'Tesla', model: 'Model S', package: 'P100D', customer_id: '1'}
const badOrder = {make: 'Lamborghini', model: 'Centenario', package: 'Roadster', customer_id: ''}

before(done => {
  database.startMock(done)
})

describe('orders endpoint', () => {
  it('returns order data on successful POST to orders route', done => {
    request
    .post('/api/orders')
    .send(testOrder)
    .then(res => {
      assert.equal(res.statusCode, 200)
      assert.include(res.header['content-type'], 'application/json')
      const order = JSON.parse(res.text)
      // Since Mongo adds data to the object, the simplest way of testing equality
      //  is to cycle through the original object's keys and check that they
      //  made it into the saved document.
      Object.keys(testOrder).forEach(key => assert.equal(testOrder[key], order[key]))
      done()
    })
    .catch(err => {
      done(err)
    })
  })

  it('returns error on poorly formed POST to orders route', done => {
    request
    .post('/api/orders')
    .send(badOrder)
    .then(response => {
      done(response)
    })
    .catch(error => {
      assert.equal(error.status, 400)
      const errorObject = JSON.parse(error.response.text)
      assert.equal(errorObject.name, 'ValidationError')
      assert.equal(errorObject.errors.customer_id.message, 'Path `customer_id` is required.')
      done()
    })
    .catch(err => {
      done(err)
    })
  })

  it('returns list of saved orders from database on GET to orders route', done => {
    request
    .get('/api/orders')
    .then(res => {
      assert.equal(res.statusCode, 200)
      assert.include(res.header['content-type'], 'application/json')
      const orderList = JSON.parse(res.text)
      assert.equal(orderList.length, 1)
      Object.keys(testOrder).forEach(key => assert.equal(testOrder[key], orderList[0][key]))
      done()
    })
    .catch(err => {
      done(err)
    })
  })
})
