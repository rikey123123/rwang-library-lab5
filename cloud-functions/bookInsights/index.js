// Task 9.2 - bookInsights
// Alibaba Cloud Function Compute, Node.js 20, event function behind an
// HTTP Trigger. Reads the books collection of the Lab 7/8 Firestore
// database over the Firestore REST API and returns the aggregated figures
// that the Book Insights dashboard renders.

const PROJECT_ID = 'nomash-library-lab7'
const COLLECTION = 'books'
const FIRESTORE_URL =
  'https://firestore.googleapis.com/v1/projects/' +
  PROJECT_ID +
  '/databases/(default)/documents/' +
  COLLECTION +
  '?pageSize=300'

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async (event, context) => {
  const request = parseEvent(event)
  if (request.method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' }
  }

  try {
    const books = await fetchBooks()

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        total: books.length,
        categories: countByCategory(books),
        featuredBook: pickFeatured(books)
      })
    }
  } catch (err) {
    console.error('bookInsights failed:', err)

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to read the books collection' })
    }
  }
}

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

function parseEvent(event) {
  try {
    const raw = Buffer.isBuffer(event) ? event.toString('utf8') : event
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return { method: (parsed.httpMethod || parsed.method || 'GET').toUpperCase() }
  } catch (err) {
    return { method: 'GET' }
  }
}
