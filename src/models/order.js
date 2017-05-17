const mongoose = require('mongoose')
const Q = require('q')

const Schema = mongoose.Schema
mongoose.Promise = Q.promise

const order = new Schema({
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
    required: true
  },
  customer_id: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', order)
