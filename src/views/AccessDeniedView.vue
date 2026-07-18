<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const loginDestination = computed(() => ({
  name: 'Login',
  query: {
    redirect: typeof route.query.redirect === 'string' ? route.query.redirect : '/about'
  }
}))
</script>

<template>
  <section class="text-center py-5">
    <h1 class="display-5 text-danger">Access Denied</h1>
    <p class="lead">You must be logged in to view this page.</p>

    <router-link :to="loginDestination" class="btn btn-primary">Go to Login</router-link>
    <router-link to="/" class="btn btn-outline-secondary ms-2">Return Home</router-link>
  </section>
</template>
