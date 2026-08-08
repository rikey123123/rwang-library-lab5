<template>
  <div class="container mt-4">
    <h1>Get All Book API</h1>
    <p class="text-muted">
      Returns every book in <code>src/assets/json/authors.json</code> as JSON.
    </p>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="text-danger">{{ error }}</p>

    <div v-if="apiResponse" class="api-response">
      <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(false)
const error = ref(null)
const apiResponse = ref(null)

const getAllBooks = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/src/assets/json/authors.json')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const authors = await response.json()

    // Flatten every author's famousWorks into a single list of books
    const books = authors.flatMap((author) =>
      author.famousWorks.map((work) => ({
        title: work.title,
        year: work.year,
        author: author.name
      }))
    )

    apiResponse.value = {
      success: true,
      data: {
        totalBooks: books.length,
        books: books
      },
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    error.value = `Error loading books data: ${err.message}`
    console.error('Error loading books data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getAllBooks()
})
</script>

<style scoped>
.api-response pre {
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 1rem;
}
</style>
