const chai = require('chai')
const assert = chai.assert
const Order = require('../src/models/order')

describe('order model', () => {
  const testOrder = {
    make: 'Tesla',
    model: 'Model S',
    package: 'gold',
    customer_id: '1'
  }
  const badOrder = {
    make: 'Lamborghini',
    model: 'Centenario',
    package: 'Roadster',
    customer_id: ''
  }

  it('validates well formed order', done => {
    let order = new Order(testOrder)
    order.validate(err => {
      assert.notOk(err)
      done()
    })
  })

  it('errors when missing customer_id field', done => {
    let order = new Order(badOrder)
    order.validate(err => {
      assert.ok(err)
      assert.equal(err.errors.customer_id.properties.message, 'Path `{PATH}` is required.')
      done()
    })
  })
})
