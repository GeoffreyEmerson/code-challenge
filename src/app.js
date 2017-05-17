const express = require('express');
const app = express();

module.exports = app
.get('/api/healthcheck', (req,res) => res.send({status:"ok"}) )
;