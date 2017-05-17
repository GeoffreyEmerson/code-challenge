const mongoose = require('mongoose')

const Schema = mongoose.Schema
mongoose.Promise = Promise

const requestSchema = new Schema({
  parentOrder: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  parameters: {
    type: Object,
    required: true
  },
  pending: {
    type: Boolean,
    default: true
  },
  response: {
    type: Object
  }
}, { timestamps: true })

module.exports = mongoose.model('Request', requestSchema)
