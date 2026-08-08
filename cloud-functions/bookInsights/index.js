'use strict'

// Task 9.2 - bookInsights
// Alibaba Cloud Function Compute Web Function, Node.js 20 runtime.
// Reads the books collection of the Lab 7/8 Firestore database over the
// Firestore REST API and returns the aggregated figures that the Book
// Insights dashboard renders.

const http = require('node:http')

const PROJECT_ID = 'nomash-library-lab7'
const COLLECTION = 'books'
const FIRESTORE_URL =
  'https://firestore.googleapis.com/v1/projects/' +
  PROJECT_ID +
  '/databases/(default)/documents/' +
  COLLECTION +
  '?pageSize=300'

const PORT = Number(process.env.FC_SERVER_PORT || process.env.PORT || 9000)

console.log('bookInsights starting, node ' + process.version + ', port ' + PORT)

const server = http.createServer(async (request, response) => {
  console.log(request.method + ' ' + request.url)

  // The browser sends a preflight request before the real GET.
  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders())
    response.end()

    return
  }

  try {
    const books = await fetchBooks()

    send(response, 200, {
      total: books.length,
      categories: countByCategory(books),
      featuredBook: pickFeatured(books)
    })
  } catch (error) {
    console.error('bookInsights failed: ' + error.message)

    send(response, 500, { error: 'Failed to read the books collection' })
  }
})

server.on('error', (error) => {
  console.error('server error: ' + error.message)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log('bookInsights listening on 0.0.0.0:' + PORT)
})

async function fetchBooks() {
  const response = await fetch(FIRESTORE_URL)

  if (!response.ok) {
    throw new Error('Firestore returned ' + response.status)
  }

  const payload = await response.json()
  const documents = payload.documents || []

  return documents.map((document) => {
    const fields = document.fields || {}

    return {
      name: fields.name ? fields.name.stringValue : 'Untitled',
      isbn: fields.isbn ? Number(fields.isbn.integerValue) : 0
    }
  })
}

// The books collection stores an ISBN and a name, so the categories are the
// ISBN bands the books fall into rather than a separate stored field.
function categoryOf(book) {
  const band = Math.floor(book.isbn / 1000) * 1000

  return 'ISBN ' + band + '-' + (band + 999)
}

function countByCategory(books) {
  return books.reduce((tally, book) => {
    const category = categoryOf(book)
    tally[category] = (tally[category] || 0) + 1

    return tally
  }, {})
}

// The featured book is the newest addition, i.e. the highest ISBN.
function pickFeatured(books) {
  if (books.length === 0) {
    return null
  }

  const featured = books.reduce((best, book) => (book.isbn > best.isbn ? book : best))

  return {
    title: featured.name,
    isbn: featured.isbn,
    category: categoryOf(featured)
  }
}

function send(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders()
  })
  response.end(JSON.stringify(payload))
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}
