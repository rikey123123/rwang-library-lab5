<script setup>
// Library navigation header. Provides links to the Firebase auth flows
// (register / sign in / log out). Role-gated dashboards are reached
// automatically after sign-in, so they are not listed here.
</script>

<template>
  <div class="container">
    <header class="d-flex justify-content-center py-3 border-bottom">
      <ul class="nav nav-pills align-items-center">
        <li class="nav-item">
          <router-link to="/" class="nav-link" exact-active-class="active">
            Home
          </router-link>
        </li>

        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">
            About
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/FireRegister"
            class="nav-link"
            active-class="active"
          >
            Register
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/FireLogin"
            class="nav-link"
            active-class="active"
          >
            Firebase Login
          </router-link>
        </li>

        <li class="nav-item">
          <router-link
            to="/logout"
            class="nav-link"
            active-class="active"
          >
            Log out
          </router-link>
        </li>
      </ul>
    </header>
  </div>
</template>
