<template>
  <main class="insights-page">
    <h1>Book Insights</h1>

    <p class="subtitle">
      Cloud-powered insights from Firestore
    </p>

    <button
      @click="loadInsights"
      :disabled="loading"
    >
      {{ loading ? 'Loading...' : 'Generate Book Insights' }}
    </button>

    <div
      v-if="insights"
      class="dashboard"
    >
      <section class="card">
        <h2>Total Books</h2>

        <div class="big-number">
          {{ insights.total }}
        </div>
      </section>

      <section
        v-if="insights.featuredBook"
        class="card"
      >
        <h2>Featured Book</h2>

        <h3>
          {{ insights.featuredBook.title }}
        </h3>

        <p>
          ISBN:
          {{ insights.featuredBook.isbn }}
        </p>

        <p>
          Category:
          {{ insights.featuredBook.category }}
        </p>
      </section>

      <section class="card">
        <h2>Books by Category</h2>

        <div
          v-for="(amount, category) in insights.categories"
          :key="category"
          class="category-row"
        >
          <span>
            {{ category }}
          </span>

          <strong>
            {{ amount }}
          </strong>
        </div>
      </section>
    </div>

    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const insights = ref(null)
const loading = ref(false)
const error = ref('')

// HTTP Trigger endpoint of the bookInsights function on Alibaba Cloud
// Function Compute. The function reads the Firestore books collection and
// returns the aggregated figures rendered below.
const functionUrl = 'https://bookinsights-kabttjjdji.ap-southeast-1.fcapp.run'

const loadInsights = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await axios.get(functionUrl)

    insights.value = response.data
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load book insights'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.insights-page {
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
}

.subtitle {
  margin-bottom: 25px;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.dashboard {
  margin-top: 35px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.big-number {
  font-size: 48px;
  font-weight: bold;
  margin-top: 15px;
}

.category-row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.error {
  margin-top: 20px;
  color: red;
}
</style>