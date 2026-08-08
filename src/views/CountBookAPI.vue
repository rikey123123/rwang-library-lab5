<template>
  <div class="container mt-4">
    <h1>Count Book API</h1>
    <p class="text-muted">
      A simple read-only API built from local data
      (<code>src/assets/json/authors.json</code>).
    </p>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="text-danger">{{ error }}</p>

    <div v-if="apiResponse" class="mb-3">
      <p class="mb-1">Number of authors: <strong>{{ authorsCount }}</strong></p>
      <p class="mb-0">Number of books: <strong>{{ totalBooks }}</strong></p>
    </div>

    <div v-if="apiResponse" class="api-response">
      <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const authors = ref([])
const loading = ref(false)
const error = ref(null)
const apiResponse = ref(null)

const authorsCount = ref(0)
const totalBooks = ref(0)

const calculateStats = () => {
  authorsCount.value = authors.value.length
  totalBooks.value = authors.value.reduce((total, author) => {
    return total + author.famousWorks.length
  }, 0)
}

const getApiData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('/src/assets/json/authors.json')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    authors.value = data

    calculateStats()
  } catch (err) {
    error.value = `Error loading authors data: ${err.message}`
    console.error('Error loading authors data:', err)
  } finally {
    loading.value = false
  }

  apiResponse.value = {
    success: true,
    data: {
      authorsCount: authorsCount.value,
      totalBooks: totalBooks.value,
      authors: authors.value.map((author) => ({
        name: author.name,
        bookCount: author.famousWorks.length
      }))
    },
    timestamp: new Date().toISOString()
  }
}

onMounted(() => {
  getApiData()
})

defineExpose({
  getApiData
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
