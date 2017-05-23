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

  it('validates', async () => {
    try {
      newUser1 = new User(testUser)
      await newUser1.validate()
    } catch (err) {
      throw err
    }
  })

  it('thows error for missing username', async () => {
    try {
      newUser1 = new User(badUser)
      const result = await newUser1.validate()
      assert.notOk(result)
    } catch (err) {
      assert.ok(err)
      assert.equal(err.errors.username.message, 'Path `username` is required.')
    }
  })

  it('thows error for missing password', async () => {
    try {
      newUser1 = new User(badUser2)
      const result = await newUser1.validate()
      assert.notOk(result)
    } catch (err) {
      assert.ok(err)
      assert.equal(err.errors.password.message, 'Path `password` is required.')
    }
  })

  it('thows error for missing email', async () => {
    try {
      newUser1 = new User(badUser3)
      const result = await newUser1.validate()
      assert.notOk(result)
    } catch (err) {
      assert.ok(err)
      assert.equal(err.errors.email.message, 'Path `email` is required.')
    }
  })

  it('comparePassword returns true with correct password', async () => {
    try {
      newUser1 = new User(testUser)
      const savedUser = await newUser1.save()
      testUser._id = savedUser._id
      const foundUser = await User.findById(testUser._id)
      const match = await foundUser.comparePassword(testUser.password)
      assert.equal(match, true)
    } catch (err) {
      throw err
    }
  })

  it('comparePassword returns false with bad password', async () => {
    try {
      const foundUser = await User.findById(testUser._id)
      const match = await foundUser.comparePassword('wrongpass')
      assert.equal(match, false)
    } catch (err) {
      throw err
    }
  })

  it('does not store plaintext password', async () => {
    try {
      const newUser2 = new User(testUser2)
      const savedUser2 = await newUser2.save()
      const foundUser2 = await User.findById(savedUser2._id)
      const match = await foundUser2.comparePassword(testUser2.password)
      assert.equal(match, true)
      assert.notEqual(foundUser2.password, testUser2.password)
    } catch (err) {
      throw err
    }
  })
})
