<script setup>
// Reader landing page. Shown only after the navigation guard confirms
// the signed-in user's Firestore role is "reader".
</script>

<template>
  <main class="container py-4">
    <h1>Reader Dashboard</h1>

    <div class="alert alert-success">
      Signed in successfully as a reader.
    </div>

    <p>
      Reader users may browse books, view library resources,
      and manage their own account.
    </p>

    <RouterLink class="btn btn-outline-danger" to="/logout">
      Log out
    </RouterLink>
  </main>
</template>
