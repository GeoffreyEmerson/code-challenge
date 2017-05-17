const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert
const app = require('../src/app')

chai.use(chaiHttp)
const request = chai.request(app)

describe('healthcheck endpoint', () => {
  it('returns status ok on GET to healthcheck route', done => {
    request
      .get('/api/healthcheck')
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
