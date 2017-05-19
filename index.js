const http = require('http')
const database = require('./src/database')
const app = require('./src/app')

database.startMock() // switch this to .start() to use an actual mongo instance

const port = process.env.PORT || 3000

const server = http.createServer(app)
server.listen(port, () => {
  console.log('Server running on', server.address())
})

// Enable mock supplier APIs
const mockServers = require('./test/mock.external-api')
const acmeServer = mockServers.acme.listen(3050, () => {
  console.log('Mock ACME server running on', acmeServer.address())
})
const ranierServer = mockServers.rainer.listen(3051, () => {
  console.log('Mock Ranier server running on', ranierServer.address())
})
