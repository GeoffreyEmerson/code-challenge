const http = require('http')
const database = require('./src/database')
const app = require('./src/app')
const mockServers = require('./test/mock.external-api')
const loadDummyData = require('./dummydata')

const port = process.env.PORT || 3000
const nodeEnv = process.env.NODE_ENV || 'demo'

// Start the main app API
const server = http.createServer(app)
server.listen(port, () => {
  console.log('Server running on', server.address())
})

const startDemoTools = async () => {
  // Enable mock supplier APIs
  const acmeServer = await mockServers.acme.listen(3050)
  const ranierServer = await mockServers.rainer.listen(3051)
  console.log('Mock ACME server running on', acmeServer.address())
  console.log('Mock Ranier server running on', ranierServer.address())

  if (nodeEnv === 'live') {
    // a live environment uses a local Mongo database, which is usefull
    //  for examining saved documents on the server during development
    database.start()
  } else {
    // startMock uses a Mockgoose database, which is default for this demo project
    database.startMock(loadDummyData)
  }
}

startDemoTools()
