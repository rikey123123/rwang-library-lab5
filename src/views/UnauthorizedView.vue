<script setup>
// Shown when a signed-in user tries to reach a route whose required role
// does not match their Firestore role (e.g. a reader visiting /librarian).
</script>

<template>
  <main class="container py-4 text-center">
    <h1 class="text-danger">Access Denied</h1>

    <div class="alert alert-danger">
      Your account does not have permission to access this page.
    </div>

    <RouterLink class="btn btn-primary" to="/">
      Return home
    </RouterLink>
  </main>
</template>
