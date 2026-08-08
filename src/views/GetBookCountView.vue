<template>
  <main class="book-counter">
    <div class="counter-card">
      <h1>Book Counter</h1>

      <p>
        Use a cloud function to count the books
        stored in JSON data.
      </p>

      <button
        @click="getBookCount"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Get Book Count' }}
      </button>

      <div
        v-if="count !== null"
        class="result"
      >
        Total number of books: {{ count }}
      </div>

      <div
        v-if="error"
        class="error"
      >
        {{ error }}
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const count = ref(null)
const error = ref('')
const loading = ref(false)

// The Alibaba Cloud Function Compute HTTP endpoint for the
// countBooks function.
const functionUrl = 'https://countbooks-gdbniaqfld.ap-southeast-1.fcapp.run'

const getBookCount = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await axios.get(functionUrl)

    count.value = response.data.count
  } catch (err) {
    console.error(err)
    count.value = null
    error.value = 'Failed to get book count'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.book-counter {
  max-width: 800px;
  margin: 60px auto;
  padding: 20px;
}

.counter-card {
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
}

h1 {
  margin-bottom: 12px;
}

button {
  margin-top: 20px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.result {
  margin-top: 25px;
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
}

.error {
  margin-top: 20px;
  color: red;
}
</style>