<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import {
  doc,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'

import { auth, db } from '@/firebase'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function register() {
  message.value = ''
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must contain at least 6 characters.'
    return
  }

  loading.value = true

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )

    await setDoc(doc(db, 'users', credential.user.uid), {
      email: credential.user.email,
      role: 'reader',
      createdAt: serverTimestamp()
    })

    console.log('Registration successful:', {
      uid: credential.user.uid,
      email: credential.user.email,
      role: 'reader'
    })

    message.value = 'Registration successful.'

    // Firebase automatically signs in a newly registered user.
    // Sign out so the student can demonstrate the login process separately.
    await signOut(auth)

    await router.push({ name: 'fire-login' })
  } catch (error) {
    console.error('Registration error:', error.code)
    errorMessage.value = getReadableError(error.code)
  } finally {
    loading.value = false
  }
}

function getReadableError(code) {
  const messages = {
    'auth/email-already-in-use': 'This email address is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'The password is too weak.',
    'auth/operation-not-allowed': 'Email/password authentication has not been enabled.'
  }

  return messages[code] || `Registration failed: ${code}`
}
</script>

<template>
  <main class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h1 class="h3 text-center mb-4">Create an Account</h1>

            <form @submit.prevent="register">
              <div class="mb-3">
                <label for="register-email" class="form-label">Email</label>
                <input
                  id="register-email"
                  v-model.trim="email"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="register-password" class="form-label">Password</label>
                <input
                  id="register-password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  minlength="6"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="confirm-password" class="form-label">Confirm password</label>
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  minlength="6"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                {{ loading ? 'Creating account...' : 'Register' }}
              </button>
            </form>

            <div
              v-if="message"
              class="alert alert-success mt-3"
              role="status"
            >
              {{ message }}
            </div>

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
