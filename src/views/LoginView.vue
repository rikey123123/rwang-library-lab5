<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../auth'

const username = ref('')
const password = ref('')
const loginError = ref('')

const route = useRoute()
const router = useRouter()

const handleLogin = () => {
  loginError.value = ''

  const loginSucceeded = login(username.value, password.value)

  if (!loginSucceeded) {
    loginError.value = 'Invalid username or password.'
    return
  }

  const requestedPath =
    typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/about'

  router.push(requestedPath)
}
</script>

<template>
  <section class="row justify-content-center login-page">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="h3 text-center mb-4">Member Login</h1>

          <div class="alert alert-info">
            Demo username: <strong>admin</strong><br />
            Demo password: <strong>Library123!</strong>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="login-username" class="form-label">Username</label>
              <input
                id="login-username"
                v-model.trim="username"
                type="text"
                class="form-control"
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
                required
              />
            </div>

            <div v-if="loginError" class="alert alert-danger">{{ loginError }}</div>

            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  margin-top: 3rem;
}
</style>
