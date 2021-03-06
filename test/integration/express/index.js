'use strict'

var app = require('express')()
var protect = require('../../..')('express')
var { is, comment } = require('tap')

comment('express integration')

app.use(protect)

app.get('/', function (req, res) {
  res.send('content')
})

app.listen(3000, function () {
  var req = require('http').get('http://localhost:3000')

  req.on('response', function (res) {
    is(res.statusCode, 503)
    is(res.headers['retry-after'], '10')

    setTimeout(function () {
      is(protect.overload, false)
      var req = require('http').get('http://localhost:3000')

      req.on('response', function (res) {
        is(res.statusCode, 200)
        protect.stop()
        process.exit()
      }).end()
    }, parseInt(res.headers['retry-after'], 10))
  }).end()

  sleep(500)
})

function sleep (msec) {
  var start = Date.now()
  while (Date.now() - start < msec) {}
}
