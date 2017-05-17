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

  it('returns status ok on GET to healthcheck route', done => {
    request
      .get(`localhost:${port}/api/healthcheck`)
      .end((err, res) => {
        if (err) return done(err)
        assert.equal(res.statusCode, 200)
        assert.include(res.header['content-type'], 'application/json')
        const result = JSON.parse(res.text)
        assert.equal(result.status, 'ok')
        done()
      })
  })
})
