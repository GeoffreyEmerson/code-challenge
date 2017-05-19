const mongoose = require('mongoose')

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
    type: String,
    required: true
  },
  externalRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'Request'
  }]
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
