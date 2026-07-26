<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth'

import { auth } from '@/firebase'

const router = useRouter()

const currentUser = ref(null)
const loading = ref(false)
const message = ref('')

onAuthStateChanged(auth, (user) => {
  currentUser.value = user
})

async function logOut() {
  loading.value = true
  message.value = ''

  try {
    console.log('Current user before logout:', {
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email
    })

    await signOut(auth)

    console.log('Current user after logout:', auth.currentUser)

    message.value = 'You have been logged out.'

    setTimeout(() => {
      router.push({ name: 'fire-login' })
    }, 1000)
  } catch (error) {
    console.error('Logout error:', error.code)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="container py-4">
    <h1>Log Out</h1>

    <div v-if="currentUser" class="alert alert-info">
      <p class="mb-1">
        <strong>Current user:</strong>
        {{ currentUser.email }}
      </p>

      <p class="mb-0">
        <strong>UID:</strong>
        {{ currentUser.uid }}
      </p>
    </div>

    <div v-else class="alert alert-secondary">
      No user is currently signed in.
    </div>

    <button
      class="btn btn-danger"
      :disabled="loading || !currentUser"
      @click="logOut"
    >
      {{ loading ? 'Logging out...' : 'Confirm log out' }}
    </button>

    <div
      v-if="message"
      class="alert alert-success mt-3"
      role="status"
    >
      {{ message }}
    </div>
  </main>
</template>
