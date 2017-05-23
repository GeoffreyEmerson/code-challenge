var mongoose = require('mongoose')
var Mockgoose = require('mockgoose').Mockgoose
var mockgoose = new Mockgoose(mongoose)
mongoose.Promise = Promise // Moongose throws a warning unless you re-define the Promise method

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/challenge'

const startMock = done => {
  mockgoose.prepareStorage().then(() => {
    mongoose.connect(dbURI, function (err) {
      if (err) {
        console.log('Failed connecting to Mongodb!')
        done('database connection error')
      } else {
        if (process.env.NODE_ENV !== 'test') { // for testing, success should be silent
          console.log('Successfully connected to Mockgoose database on ' + dbURI)
        }
        if (done) done()
      }
    })
  })
}

const start = done => {
  mongoose.connect(dbURI, function (err) {
    if (err) {
      console.log('Failed connecting to Mongodb!')
      done('database connection error')
    } else if (process.env.NODE_ENV !== 'test') { // for testing, success should be silent
      console.log('Successfully connected to Mongodb on ' + dbURI)
    }
    if (done) done()
  })
}

const stop = done => {
  mongoose.disconnect()
  if (done) done()
}

module.exports = {
  startMock,
  start,
  stop
}
