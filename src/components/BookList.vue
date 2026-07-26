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
        <!-- Editing mode -->
        <div v-if="editingId === book.id">
          <input
            v-model.trim="editName"
            type="text"
            aria-label="Edit book name"
          />

          <input
            v-model.number="editIsbn"
            type="number"
            aria-label="Edit ISBN"
          />

          <button @click="saveEdit(book.id)">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>

        <!-- Normal display mode -->
        <div v-else>
          <strong>{{ book.name }}</strong>
          <span> — ISBN: {{ book.isbn }}</span>

          <button @click="startEdit(book)">Edit</button>
          <button @click="removeBook(book.id)">Delete</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
import { onMounted, ref } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore'
import db from '../firebase/init.js'

export default {
  name: 'BookList',

  setup() {
    const books = ref([])
    const loading = ref(false)
    const errorMessage = ref('')

    const editingId = ref(null)
    const editName = ref('')
    const editIsbn = ref(null)

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

    const startEdit = (book) => {
      editingId.value = book.id
      editName.value = book.name
      editIsbn.value = book.isbn
    }

    const cancelEdit = () => {
      editingId.value = null
      editName.value = ''
      editIsbn.value = null
    }

    const saveEdit = async (bookId) => {
      const isbnNumber = Number(editIsbn.value)
      const bookName = editName.value.trim()

      if (!bookName || !Number.isFinite(isbnNumber)) {
        window.alert('Please enter a valid name and ISBN.')
        return
      }

      try {
        const bookReference = doc(db, 'books', bookId)

        await updateDoc(bookReference, {
          name: bookName,
          isbn: isbnNumber
        })

        cancelEdit()
        await fetchBooks()
      } catch (error) {
        console.error('Error updating book:', error)
        window.alert(`Unable to update book: ${error.message}`)
      }
    }

    const removeBook = async (bookId) => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this book?'
      )

      if (!confirmed) {
        return
      }

      try {
        await deleteDoc(doc(db, 'books', bookId))
        await fetchBooks()
      } catch (error) {
        console.error('Error deleting book:', error)
        window.alert(`Unable to delete book: ${error.message}`)
      }
    }

    onMounted(fetchBooks)

    return {
      books,
      loading,
      errorMessage,
      editingId,
      editName,
      editIsbn,
      startEdit,
      cancelEdit,
      saveEdit,
      removeBook
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
