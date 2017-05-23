const chai = require('chai')
const request = require('superagent')
const assert = chai.assert
const app = require('../src/app')

const port = process.env.PORT || 3000
let server

describe('healthcheck endpoint', () => {
  before(done => {
    server = app.listen(port, done)
  })

  after(done => {
    server.close(done)
  })

  it('returns status ok on GET to healthcheck route', async () => {
    try {
      const result = await request
      .get(`localhost:${port}/api/healthcheck`)
      assert.equal(result.statusCode, 200)
      assert.include(result.header['content-type'], 'application/json')
      assert.equal(result.body.status, 'ok')
    } catch (err) {
      throw err
    }
  })
})
