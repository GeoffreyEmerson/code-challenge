const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

mongoose.Promise = Promise
const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
})

// Credit to https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
UserSchema.pre('save', function (next) {
  var user = this
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next()
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err)
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)
      // override the cleartext password with the hashed one
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', UserSchema)
