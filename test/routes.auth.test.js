const chai = require('chai')
const request = require('superagent')
const database = require('../src/database')
const app = require('../src/app')
const mockServers = require('./mock.external-api')
const User = require('../src/models/user')

const assert = chai.assert
const port = process.env.PORT || 3000
let server, acmeServer, rainerServer

describe.only('auth endpoints', () => {
  const user1 = { username: 'test-runner1', password: 'user-test-pass', email: 'user@mail.com' }
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
        .post(`localhost:${port}/api/auth`)
        .send({email: user1.email, password: user1.password})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'success')
      assert.ok(response.body.userToken)
    } catch (err) {
      assert.notOk(err, err.message)
    }
  })

  it('bad password in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth`)
        .send({email: user1.email, password: 'wrong_password'})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'There was a problem with your email and/or password.')
      assert.notOk(response.body.userToken)
    } catch (err) {
      assert.notOk(err, err.message)
    }
  })

  it('empty password in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth`)
        .send({email: user1.email, password: ''})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'Both email and password are required')
      assert.notOk(response.body.userToken)
    } catch (err) {
      assert.notOk(err, err.message)
    }
  })

  it('bad email in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth`)
        .send({email: 'bad@email.com', password: user1.password})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'There was a problem with your email and/or password.')
      assert.notOk(response.body.userToken)
    } catch (err) {
      assert.notOk(err, err.message)
    }
  })

  it('empty email in POST on auth route returns error', async () => {
    let response
    try {
      response = await request
        .post(`localhost:${port}/api/auth`)
        .send({email: '', password: user1.password})
      assert.equal(response.statusCode, 200)
      assert.include(response.header['content-type'], 'application/json')
      assert.equal(response.body.status, 'fail')
      assert.equal(response.body.message, 'Both email and password are required')
      assert.notOk(response.body.userToken)
    } catch (err) {
      assert.notOk(err, err.message)
    }
  })
})
