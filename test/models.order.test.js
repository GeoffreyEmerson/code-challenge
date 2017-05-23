const chai = require('chai')
const assert = chai.assert
const Order = require('../src/models/order')
const Customer = require('../src/models/customer')
const database = require('../src/database')

describe('order model', () => {
  const testOrder = {
    make: 'Tesla',
    model: 'Model S',
    package: 'gold'
  }
  const badOrder = {
    make: 'Lamborghini',
    model: 'Centenario',
    package: 'silver'
  }
  const testCustomer = {
    name: 'Sally',
    address: '1234 Any St.',
    city: 'Eugene',
    state: 'OR',
    zip: '97401',
    country: 'USA'
  }
  const distantCustomer = {
    name: 'Sergei',
    address: 'ul. Stanislavskogo, 15',
    city: 'Novosibirsk',
    state: 'Novosibirsk Oblast',
    zip: '630054',
    country: 'Russia'
  }

  before(done => {
    database.startMock(done)
  })
  after(done => {
    database.stop(done)
  })

  it('validates well formed order', async () => {
    let customer = new Customer(testCustomer)
    try {
      customer = await customer.save()
      testOrder.customer_id = customer._id
      const order = new Order(testOrder)
      const error = order.validateSync()
      assert.notOk(error)
    } catch (err) {
      throw err
    }
  })

  it('errors when missing customer_id field', async () => {
    try {
      const order = new Order(badOrder)
      const error = await order.validateSync()
      assert.ok(error)
      assert.equal(error.errors.customer_id.properties.message, 'Path `{PATH}` is required.')
    } catch (err) {
      throw err
    }
  })

  it('errors when customer is not in a valid shipping zone', async () => {
    try {
      let badCustomer = new Customer(distantCustomer)
      badCustomer = await badCustomer.save()
      badOrder.customer_id = badCustomer._id
      const order = new Order(badOrder)
      const error = await new Promise(resolve => order.validate(resolve))
      assert.ok(error)
      assert.equal(error.errors.customer_id.properties.message, 'Customer ID {VALUE} does not have a valid delivery destination!')
    } catch (err) {
      throw err
    }
  })
})
