<script setup>
import BHeader from './components/BHeader.vue'
</script>

<template>
  <div class="app-shell">
    <header>
      <BHeader />
    </header>

    <main class="container py-4">
      <router-view />
    </main>
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

main.container {
  max-width: 1200px;
}
</style>
