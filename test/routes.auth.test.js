const chai = require('chai')
const request = require('superagent')
const database = require('../src/database')
const app = require('../src/app')
const mockServers = require('./mock.external-api')
const User = require('../src/models/user')

const assert = chai.assert
const port = process.env.PORT || 3000
let server, acmeServer, rainerServer

describe('auth endpoints', () => {
  const user1 = { username: 'test-runner1', password: 'user-test-pass', email: 'user@mail.com' }
  const user2 = { username: 'new-user', password: 'user-new-pass', confirmation: 'user-new-pass', email: 'newuser@mail.com' }
  const badUser = { username: 'bad-user', password: 'user-pass', confirmation: '', email: 'baduser@mail.com' }
  let standardUser

  before(done => {
    database.startMock(done)
  })

  after(done => {
    database.stop(done)
  })

  before(async () => {
    await Promise.all([
      server = app.listen(port),
      acmeServer = mockServers.acme.listen(3050),
      rainerServer = mockServers.rainer.listen(3051)
    ])
  })

  after(async () => {
    await Promise.all([
      server.close(),
      acmeServer.close(),
      rainerServer.close()
    ])
  })

  before(async () => {
    standardUser = await new User(user1)
    standardUser = await standardUser.save()
  })

  it('properly formatted POST on auth route returns token', async () => {
    try {
      const response = await request
        .post(`localhost:${port}/api/auth/login`)
        .send({email: user1.email, password: user1.password})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'success')
      assert.ok(response.body.userToken)
    } catch (err) {
      throw err
    }
  })

  it('bad password in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth/login`)
        .send({email: user1.email, password: 'wrong_password'})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'There was a problem with your email and/or password.')
      assert.notOk(response.body.userToken)
    } catch (err) {
      throw err
    }
  })

  it('empty password in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth/login`)
        .send({email: user1.email, password: ''})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'Both email and password are required')
      assert.notOk(response.body.userToken)
    } catch (err) {
      throw err
    }
  })

  it('bad email in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth/login`)
        .send({email: 'bad@email.com', password: user1.password})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'There was a problem with your email and/or password.')
      assert.notOk(response.body.userToken)
    } catch (err) {
      throw err
    }
  })

  it('empty email in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth/login`)
        .send({email: '', password: user1.password})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'Both email and password are required')
      assert.notOk(response.body.userToken)
    } catch (err) {
      throw err
    }
  })

  it('signup succeeds in POST on auth/signup route', async () => {
    try {
      await request
        .post(`localhost:${port}/api/auth/signup`)
        .send(user2)
      const response = await request
        .post(`localhost:${port}/api/auth/login`)
        .send({email: user2.email, password: user2.password})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'success')
      assert.ok(response.body.userToken)
    } catch (err) {
      throw err
    }
  })

  it('signup fails in POST on auth/signup route', async () => {
    try {
      let response = await request
        .post(`localhost:${port}/api/auth/signup`)
        .send(badUser)
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      // Double check that the user was not saved to DB
      response = await request
        .post(`localhost:${port}/api/auth/login`)
        .send({email: badUser.email, password: badUser.password})
      assert.notOk(response.body.userToken)
    } catch (err) {
      throw err
    }
  })
})
