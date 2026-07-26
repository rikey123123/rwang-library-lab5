<template>
  <main class="container">
    <h1>Add Book</h1>

    <form @submit.prevent="addBook">
      <div>
        <label for="isbn">ISBN</label>
        <input
          id="isbn"
          v-model.number="isbn"
          type="number"
          min="1"
          required
        />
      </div>

      <div>
        <label for="name">Book name</label>
        <input
          id="name"
          v-model.trim="name"
          type="text"
          required
        />
      </div>

      <button type="submit" :disabled="saving">
        {{ saving ? 'Adding...' : 'Add Book' }}
      </button>
    </form>

    <p v-if="message">{{ message }}</p>

    <!-- refreshKey 改变后重新加载 BookList -->
    <BookList :key="refreshKey" />
  </main>
</template>

<script>
import { ref } from 'vue'
import { addDoc, collection } from 'firebase/firestore'
import db from '../firebase/init.js'
import BookList from '../components/BookList.vue'

export default {
  name: 'AddBookView',

  components: {
    BookList
  },

  setup() {
    const isbn = ref(null)
    const name = ref('')
    const saving = ref(false)
    const message = ref('')
    const refreshKey = ref(0)

    const addBook = async () => {
      const isbnNumber = Number(isbn.value)
      const bookName = name.value.trim()

      if (!Number.isFinite(isbnNumber) || isbnNumber <= 0) {
        message.value = 'ISBN must be a valid positive number.'
        return
      }

      if (!bookName) {
        message.value = 'Book name is required.'
        return
      }

      saving.value = true
      message.value = ''

      try {
        await addDoc(collection(db, 'books'), {
          isbn: isbnNumber,
          name: bookName
        })

        message.value = 'Book added successfully.'
        isbn.value = null
        name.value = ''

        // 使 BookList 重新加载
        refreshKey.value += 1
      } catch (error) {
        console.error('Error adding book:', error)
        message.value = `Unable to add book: ${error.message}`
      } finally {
        saving.value = false
      }
    }

    return {
      isbn,
      name,
      saving,
      message,
      refreshKey,
      addBook
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 720px;
  margin: 30px auto;
}

form {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

input {
  display: block;
  width: 100%;
  padding: 8px;
}

button {
  width: fit-content;
  padding: 8px 16px;
}
</style>
