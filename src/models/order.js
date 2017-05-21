const mongoose = require('mongoose')
const Customer = require('./customer')

const Schema = mongoose.Schema
mongoose.Promise = Promise

const orderSchema = new Schema({
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  package: {
    type: String,
    enum: ['std', 'silver', 'gold'],
    required: [true, 'Package must be "std", "silver", or "gold".']
  },
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    validate: {
      isAsync: true,
      validator: async (value, callback) => {
        const customer = await Customer.findById(value)
        const validCountries = ['US', 'USA'] // This list probably needs a better home
        callback(validCountries.includes(customer.country))
      },
      message: 'Customer ID {VALUE} does not have a valid delivery destination!'
    },
    required: true
  },
  externalRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'Request'
  }]
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
