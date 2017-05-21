const chai = require('chai')
const User = require('../src/models/user')
const database = require('../src/database')

const assert = chai.assert

describe('user model', () => {
  let testUser = { username: 'Sally', password: 'CorrectBatteryHorseStaple', email: 'sally@ccas.site' }
  let testUser2 = { username: 'Joe', password: 'OtherPassword!', email: 'joe@ccas.site' }
  let badUser = { username: '', password: 'badUserPassword', email: 'bob@ccas.site' }
  let badUser2 = { username: 'Starbuck', password: '', email: 'starbuck@ccas.site' }
  let badUser3 = { username: 'Apollo', password: 'viper1', email: '' }
  let newUser1

  before(done => {
    database.startMock(done)
  })

  after(done => {
    database.stop(done)
  })

  it('validates', done => {
    newUser1 = new User(testUser)
    newUser1.validate(err => {
      assert.notOk(err)
      done()
    })
  })

  it('thows error for missing username', done => {
    const newUser1 = new User(badUser)
    newUser1.validate(err => {
      assert.ok(err)
      assert.equal(err.errors.username.message, 'Path `username` is required.')
      done()
    })
  })

  it('thows error for missing password', done => {
    const newUser1 = new User(badUser2)
    newUser1.validate(err => {
      assert.ok(err)
      assert.equal(err.errors.password.message, 'Path `password` is required.')
      done()
    })
  })

  it('thows error for missing email', done => {
    const newUser1 = new User(badUser3)
    newUser1.validate(err => {
      assert.ok(err)
      assert.equal(err.errors.email.message, 'Path `email` is required.')
      done()
    })
  })

  it('comparePassword returns true with correct password', done => {
    newUser1 = new User(testUser)
    newUser1.save()
    .then(savedUser => {
      testUser._id = savedUser._id
      User.findById(testUser._id)
      .then(foundUser => {
        foundUser.comparePassword(testUser.password, (err, match) => {
          if (err) done(err)
          assert.equal(match, true)
          done()
        })
      })
    })
  })

  it('comparePassword returns false with bad password', done => {
    User.findById(testUser._id)
    .then(foundUser => {
      foundUser.comparePassword('wrongpass', (err, match) => {
        if (err) done(err)
        assert.equal(match, false)
        done()
      })
    })
  })

  it('does not store plaintext password', done => {
    const newUser2 = new User(testUser2)
    newUser2.save()
    .then(savedUser2 => {
      User.findById(savedUser2._id)
      .then(foundUser2 => {
        foundUser2.comparePassword(testUser2.password, (err, match) => {
          if (err) throw err
          assert.equal(match, true)
          assert.notEqual(foundUser2.password, testUser2.password)
          done()
        })
      })
    })
  })
})
