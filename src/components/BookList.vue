<template>
  <section class="book-list">
    <h2>Books with ISBN &gt; 1000</h2>

    <p>
      Query: ISBN &gt; 1000, ordered by ISBN descending,
      limited to 5 results.
    </p>

    <p v-if="loading">Loading books...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="books.length === 0">No matching books found.</p>

    <ul v-else>
      <li v-for="book in books" :key="book.id">
        <strong>{{ book.name }}</strong>
        <span> — ISBN: {{ book.isbn }}</span>
      </li>
    </ul>
  </section>
</template>

<script>
import { onMounted, ref } from 'vue'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from 'firebase/firestore'
import db from '../firebase/init.js'

export default {
  name: 'BookList',

  setup() {
    const books = ref([])
    const loading = ref(false)
    const errorMessage = ref('')

    const fetchBooks = async () => {
      loading.value = true
      errorMessage.value = ''

      try {
        const booksQuery = query(
          collection(db, 'books'),
          where('isbn', '>', 1000),
          orderBy('isbn', 'desc'),
          limit(5)
        )

        const querySnapshot = await getDocs(booksQuery)

        books.value = querySnapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data()
        }))
      } catch (error) {
        console.error('Error fetching books:', error)
        errorMessage.value = `Unable to retrieve books: ${error.message}`
      } finally {
        loading.value = false
      }
    }

    onMounted(fetchBooks)

    return {
      books,
      loading,
      errorMessage
    }
  }
}
</script>

<style scoped>
.book-list {
  margin-top: 32px;
}

ul {
  padding: 0;
  list-style: none;
}

li {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #cccccc;
}
</style>
