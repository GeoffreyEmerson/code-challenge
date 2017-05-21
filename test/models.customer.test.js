const chai = require('chai')
const assert = chai.assert
const Customer = require('../src/models/customer')

describe('customer model', () => {
  const testCustomer = { name: 'Sally', address: '1234 Any St.', city: 'Eugene', state: 'OR', zip: '97401', country: 'USA' }
  const badCustomer1 = { name: 'Bob', address: '', city: 'Portland', state: 'OR', zip: '97035', country: 'USA' }

  it('validates well formed customer', done => {
    let customer = new Customer(testCustomer)
    customer.validate(err => {
      assert.notOk(err)
      done()
    })
  })

  it('errors when missing required field', done => {
    let customer = new Customer(badCustomer1)
    customer.validate(err => {
      assert.ok(err)
      assert.equal(err.errors.address.message, 'Path `address` is required.')
      done()
    })
  })
})
