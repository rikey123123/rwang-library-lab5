<script setup>
import { useRouter } from 'vue-router'
import { isAuthenticated, logout } from '../auth'

const router = useRouter()

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="container">
    <header class="d-flex justify-content-center py-3 border-bottom">
      <ul class="nav nav-pills align-items-center">
        <li class="nav-item">
          <router-link to="/" class="nav-link" exact-active-class="active">
            Home (Week 5)
          </router-link>
        </li>

        <li v-if="isAuthenticated" class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>

        <li class="nav-item">
          <router-link to="/addbook" class="nav-link" active-class="active">Add Book</router-link>
        </li>

        <li class="nav-item">
          <router-link to="/book-counter" class="nav-link" active-class="active">Book Counter</router-link>
        </li>

        <li v-if="!isAuthenticated" class="nav-item">
          <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
        </li>

        <li v-else class="nav-item ms-2">
          <button type="button" class="btn btn-outline-danger" @click="handleLogout">Logout</button>
        </li>
      </ul>
    </header>
  </div>
</template>
