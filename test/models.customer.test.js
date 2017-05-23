const chai = require('chai')
const assert = chai.assert
const Customer = require('../src/models/customer')

describe('customer model', () => {
  const testCustomer = { name: 'Sally', address: '1234 Any St.', city: 'Eugene', state: 'OR', zip: '97401', country: 'USA' }
  const badCustomer1 = { name: 'Bob', address: '', city: 'Portland', state: 'OR', zip: '97035', country: 'USA' }

  it('validates well formed customer', () => {
    const customer = new Customer(testCustomer)
    const error = customer.validateSync()
    assert.notOk(error)
  })

  it('errors when missing required field', () => {
    const customer = new Customer(badCustomer1)
    const error = customer.validateSync()
    assert.ok(error)
    assert.equal(error.errors.address.message, 'Path `address` is required.')
  })
})
