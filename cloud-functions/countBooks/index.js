'use strict'

// Task 9.1 - countBooks
// Alibaba Cloud Function Compute Web Function, Node.js 20 runtime.
// A Web Function runs as a long-lived HTTP server rather than a handler,
// so this file starts one on the port Function Compute provides and
// answers every request with the number of books held in books.json.

const http = require('node:http')

const books = require('./books.json')

const PORT = process.env.PORT || process.env.FC_SERVER_PORT || 9000

const server = http.createServer((request, response) => {
  // The browser sends a preflight request before the real GET.
  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders())
    response.end()

    return
  }

  const body = JSON.stringify({ count: books.length })

  response.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders()
  })
  response.end(body)
})

server.listen(PORT, () => {
  console.log('countBooks listening on port ' + PORT)
})

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}
