<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { auth, db } from '@/firebase'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function signIn() {
  errorMessage.value = ''
  loading.value = true

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )

    const user = credential.user

    const userSnapshot = await getDoc(doc(db, 'users', user.uid))

    if (!userSnapshot.exists()) {
      throw new Error('role-document-missing')
    }

    const role = userSnapshot.data().role

    // Use a safe object for your assessment screenshot.
    // Do not print token internals.
    console.table({
      uid: user.uid,
      email: user.email,
      role
    })

    if (role === 'librarian') {
      await router.push({ name: 'librarian-dashboard' })
    } else if (role === 'reader') {
      await router.push({ name: 'reader-dashboard' })
    } else {
      await router.push({ name: 'unauthorized' })
    }
  } catch (error) {
    console.error('Sign-in error:', error.code || error.message)

    const messages = {
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/invalid-credential': 'The email or password is incorrect.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.'
    }

    errorMessage.value =
      messages[error.code] ||
      'Unable to sign in. Check the account and role configuration.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h1 class="h3 text-center mb-4">Sign In</h1>

            <form @submit.prevent="signIn">
              <div class="mb-3">
                <label for="login-email" class="form-label">Email</label>
                <input
                  id="login-email"
                  v-model.trim="email"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="login-password" class="form-label">Password</label>
                <input
                  id="login-password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                {{ loading ? 'Signing in...' : 'Sign in via Firebase' }}
              </button>
            </form>

            <div
              v-if="errorMessage"
              class="alert alert-danger mt-3"
              role="alert"
            >
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
