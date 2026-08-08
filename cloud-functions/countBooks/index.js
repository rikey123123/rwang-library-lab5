'use strict'

// Task 9.1 - countBooks
// Alibaba Cloud Function Compute Web Function, Node.js 20 runtime.
// A Web Function runs as a long-lived HTTP server rather than a handler,
// so this file starts one on the port Function Compute probes and answers
// every request with the number of books held in books.json.

const http = require('node:http')

const books = require('./books.json')

// Function Compute passes the port it will probe through the environment;
// 9000 is the platform default when nothing is set.
const PORT = Number(process.env.FC_SERVER_PORT || process.env.PORT || 9000)

console.log('countBooks starting, node ' + process.version + ', port ' + PORT)
console.log('books loaded: ' + books.length)

const server = http.createServer((request, response) => {
  console.log(request.method + ' ' + request.url)

  // The browser sends a preflight request before the real GET.
  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders())
    response.end()

    return
  }

  response.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders()
  })
  response.end(JSON.stringify({ count: books.length }))
})

server.on('error', (error) => {
  console.error('server error: ' + error.message)
})

// Binding 0.0.0.0 explicitly, so the port is reachable over IPv4 from the
// platform health check rather than only over IPv6.
server.listen(PORT, '0.0.0.0', () => {
  console.log('countBooks listening on 0.0.0.0:' + PORT)
})

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}
