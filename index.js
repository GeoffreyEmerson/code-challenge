const http = require('http')
const database = require('./src/database')
const app = require('./src/app')

database.startMock() // switch this to .start() to use an actual mongo instance

const port = process.env.PORT || 3000

const server = http.createServer(app)
server.listen(port, () => {
  console.log('Server running on', server.address())
})
