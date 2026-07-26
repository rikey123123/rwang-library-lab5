<script setup>
// Librarian landing page. Shown only after the navigation guard confirms
// the signed-in user's Firestore role is "librarian".
</script>

<template>
  <main class="container py-4">
    <h1>Librarian Dashboard</h1>

    <div class="alert alert-warning">
      Signed in successfully as a librarian.
    </div>

    <p>
      Librarian users may manage books, records,
      and library administration functions.
    </p>

    <RouterLink class="btn btn-outline-danger" to="/logout">
      Log out
    </RouterLink>
  </main>
</template>
