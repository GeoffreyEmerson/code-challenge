const Customer = require('../models/customer')

const post = async (req, res, next) => {
  const {name, address, city, state, zip, country} = req.body
  if (!name || !address || !city || !state || !zip || !country) {
    return res.send({
      status: 'fail',
      error: 'Creating a customer requires name, address, city, state, zip, and country.'
    })
  }
  let newCustomer, savedCustomer
  try {
    newCustomer = await new Customer({name, address, city, state, zip, country})
    savedCustomer = await newCustomer.save()
  } catch (err) {
    return res.send({
      status: 'fail',
      error: 'Problem saving customer.'
    })
  }
  if (savedCustomer._id) {
    return res.send({
      status: 'success',
      customer: savedCustomer
    })
  } else {
    return res.send({
      status: 'fail',
      customer: 'Problem with customer result from saving.'
    })
  }
}

const get = async (req, res, next) => {
  let customerList
  try {
    customerList = await Customer.find()
  } catch (err) {
    return res.send({
      status: 'fail',
      customer: 'Problem loading customer list.'
    })
  }
  res.send({
    status: 'success',
    customers: customerList
  })
}

module.exports = {
  post,
  get
}
