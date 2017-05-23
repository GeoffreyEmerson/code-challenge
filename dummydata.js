const request = require('superagent')

const User = require('./src/models/user')
const Customer = require('./src/models/customer')
const Order = require('./src/models/order')

const port = process.env.PORT || 3000

const demoUser = { username: 'Sally', email: 'sally@ccas.site', password: 'CorrectHorseBatteryStaple', confirmation: 'CorrectBatteryHorseStaple' }

const demoCustomer = {
  name: 'Bob',
  address: '1234 Any St.',
  city: 'Eugene',
  state: 'OR',
  zip: '97401',
  country: 'USA'
}

const demoOrder = {make: 'Tesla', model: 'Model S', package: 'gold'}
const demoOrder2 = {make: 'Honda', model: 'Civic', package: 'std'}

const loadDummyData = async () => {
  try {
    const newUser = new User(demoUser)
    newUser.save()
    const customer = new Customer(demoCustomer)
    const savedCustomer = await customer.save()

    let response = await request
    .post(`localhost:${port}/api/auth/login`)
    .send({email: demoUser.email, password: demoUser.password})
    const demoToken = response.body.userToken

    demoOrder.customer_id = savedCustomer._id
    response = await request
    .post(`localhost:${port}/api/order`)
    .set('token', demoToken)
    .send(demoOrder)

    demoOrder2.customer_id = savedCustomer._id
    response = await request
    .post(`localhost:${port}/api/order`)
    .set('token', demoToken)
    .send(demoOrder2)

    console.log('Demo data loaded.')
  } catch (err) {
    console.log('Error creating demo data.')
  }
}

module.exports = loadDummyData
