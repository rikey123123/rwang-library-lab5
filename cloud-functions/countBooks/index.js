'use strict'

// Task 9.1 - countBooks
// Alibaba Cloud Function Compute, Node.js 20 runtime.
// Counts the books held in the bundled books.json and returns the total
// over HTTP so that the Vue front end can display it.

const books = require('./books.json')

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

// Function Compute offers two request handler types. An HTTP handler is
// called with (request, response, context) and writes to the response; an
// event handler is called with (event, context) and returns the response.
// Supporting both keeps the function working whichever type is selected.
exports.handler = async (first, second, third) => {
  const isHttpHandler = second && typeof second.setStatusCode === 'function'
  const method = isHttpHandler
    ? (first.method || 'GET').toUpperCase()
    : methodFromEvent(first)

  const body = JSON.stringify({ count: books.length })

  if (isHttpHandler) {
    // The browser sends a preflight request before the real GET.
    return respond(second, method === 'OPTIONS' ? 204 : 200, method === 'OPTIONS' ? '' : body)
  }

  return {
    statusCode: method === 'OPTIONS' ? 204 : 200,
    headers: HEADERS,
    body: method === 'OPTIONS' ? '' : body
  }
}

function respond(response, statusCode, body) {
  response.setStatusCode(statusCode)

  Object.keys(HEADERS).forEach((key) => {
    response.setHeader(key, HEADERS[key])
  })

  response.send(body)
}

function methodFromEvent(event) {
  try {
    const raw = Buffer.isBuffer(event) ? event.toString('utf8') : event
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || {}
    const method =
      (parsed.requestContext && parsed.requestContext.http && parsed.requestContext.http.method) ||
      parsed.httpMethod ||
      parsed.method ||
      'GET'

    return String(method).toUpperCase()
  } catch (error) {
    return 'GET'
  }
}
