const http = require('http')
const jwksClient = require('jwks-rsa')
const jwt = require('jsonwebtoken')
const fs = require('fs')

// https://github.com/auth0/node-jsonwebtoken
// https://github.com/auth0/node-jwks-rsa
const jwksFile = '.codio.jwks.json'
const client = jwksClient({
  jwksUri: 'https://apollo.codio.com/lti/oidc/certs'
})

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey
    callback(null, signingKey)
  })
}

var server = http.createServer().listen(3000)

server.on('request', function (req, res) {
    if (req.method == 'POST') {
        var body = ''
    }

    req.on('data', function (data) {
        body += data
    });

    req.on('end', function () {
      jwt.verify(body, getKey, {}, function(error, decoded) {
        console.log('error: ', error)
        console.log('data: ', decoded)

        if (error) {
          res.writeHead(403, {'Content-Type': 'application/json'})
          return res.end(JSON.stringify({error}))
        }
        res.writeHead(200, {'Content-Type': 'application/json'})
        if (decoded.event === 'TEST_WEBHOOK') {
          return res.end(JSON.stringify({epoch: decoded.epoch, event: decoded.event}))
        }
        return res.end("{}")
      })

    })
})