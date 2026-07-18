# FIT5032 Assessed Lab 5 Report

**Student name:** `[Insert your full name]`<br>
**Student ID:** `[Insert your student ID]`<br>
**Unit:** FIT5032<br>
**Assessment:** Assessed Lab 5<br>
**Submission date:** `[Insert submission date]`

---

## 1. Introduction

This report documents the implementation and testing of a Vue 3 library registration application. The Week 4 starter project was extended with password confirmation validation, reactive data-binding testing, Vue Router navigation, and a simple protected-route authentication flow.

The work was completed from the course repository's `week-4-end` branch on the dedicated `assessed-lab-5` working branch. The application was verified with a successful `npm run build` before evidence was collected.

| Requirement | Implementation |
| --- | --- |
| Confirm password validation | Added `confirmPassword` and `errors.confirmPassword`, validated on blur and on form submission. |
| Reason feedback | Displays `Great to have a friend` when Reason contains the whole word `friend`, case-insensitively. |
| Data binding comparison | Username uses `v-model`; Suburb deliberately uses one-way `:value` binding. |
| Client-side routing | Added Home, About, Login, Access Denied, and catch-all routes with Vue Router. |
| Protected content | About uses `meta.requiresAuth`; a global `beforeEach` guard prevents unauthenticated access. |
| Authentication state | `auth.js` holds reactive authentication state and persists it in `sessionStorage`. |

> **Note:** This authentication mechanism is a front-end demonstration only. A production application must authenticate users and enforce authorisation on a server.

---

## 2. Task 5.1: Password Confirmation Validation

The registration form stores `password` and `confirmPassword` as separate reactive properties. When the confirmation field loses focus, `validateConfirmPassword(true)` checks for an empty value and then verifies that the two passwords are identical. The validation result uses the independent `errors.confirmPassword` property, preventing it from overwriting password-strength feedback.

The following test used a valid password and an intentionally different confirmation password. The error message demonstrates that the validation is working.

### Screenshot 1: Password Confirmation Validation

> **[INSERT SCREENSHOT 1 HERE]**<br>
> Show the Password and Confirm password fields, their different test values, the red `Passwords do not match.` message, and the form title where possible.

---

## 3. Task 5.1: Vue DevTools Data Binding Test

The form provides two contrasting binding examples.

| Field | Binding | Expected result |
| --- | --- | --- |
| Username | `v-model="formData.username"` | Editing the input immediately updates `formData.username`; changing component state updates the input. |
| Suburb | `:value="formData.suburb"` | The initial `Clayton` value is displayed, but editing the field does not write back to `formData.suburb`. |

For testing, Username was set to `TestStudent` and the displayed Suburb value was changed from `Clayton` to `Melbourne`. In Vue DevTools, `HomeView` should show `username: "TestStudent"` and `suburb: "Clayton"`. This confirms two-way binding for Username and one-way binding for Suburb.

### Screenshot 2: Testing Data Binding with Vue DevTools

> **[INSERT SCREENSHOT 2 HERE]**<br>
> Show the browser form together with Vue DevTools. Select `HomeView`, expand `formData`, and make both Username and Suburb state values readable.

---

## 4. Router Implementation

Vue Router provides client-side navigation without a complete browser-page reload. The application uses `createWebHistory()` and renders route components through `<router-view />` in `App.vue`.

| Path | Route name | Component | Access rule |
| --- | --- | --- | --- |
| `/` | `Home` | `HomeView` | Public |
| `/about` | `About` | `AboutView` | Requires authentication |
| `/login` | `Login` | `LoginView` | Public; authenticated users are redirected to About |
| `/access-denied` | `AccessDenied` | `AccessDeniedView` | Public |
| `/:pathMatch(.*)*` | N/A | N/A | Redirects to Home |

The global navigation guard checks `to.meta.requiresAuth`. When the target route requires authentication and `isAuthenticated.value` is false, the guard redirects to Access Denied and retains the originally requested path in the `redirect` query parameter. A successful login returns the user to that requested path.

### File: `src/router/index.js`

```js
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import AccessDeniedView from '../views/AccessDeniedView.vue'
import { isAuthenticated } from '../auth'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: { requiresAuth: true }
  },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/access-denied', name: 'AccessDenied', component: AccessDeniedView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return {
      name: 'AccessDenied',
      query: { redirect: to.fullPath }
    }
  }

  if (to.name === 'Login' && isAuthenticated.value) {
    return { name: 'About' }
  }

  return true
})

export default router
```

### File: `src/App.vue`

```vue
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
```

---

## 5. Home View Implementation

`HomeView.vue` is the registration-form route. It retains the Bootstrap layout and PrimeVue DataTable from the starter project, while adding the required reactive state and event handlers.

- `formData.confirmPassword` is bound to Confirm password with `v-model`.
- `validateConfirmPassword(true)` runs on blur and during `submitForm()`.
- `clearForm()` resets the form, errors, feedback, and Suburb value of `Clayton`.
- `validateReason()` uses `/\bfriend\b/i` to recognise the whole word `friend` regardless of case.
- Suburb uses `:value="formData.suburb"` deliberately to demonstrate one-way binding.
- `confirmPassword` is omitted before a valid submitted user is stored in the DataTable or card list.

### File: `src/views/HomeView.vue`

```vue
<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const emptyFormData = () => ({
  username: '',
  password: '',
  confirmPassword: '',
  isAustralian: false,
  reason: '',
  gender: '',
  suburb: 'Clayton'
})

const emptyErrors = () => ({
  username: null,
  password: null,
  confirmPassword: null,
  resident: null,
  gender: null,
  reason: null
})

const formData = ref(emptyFormData())
const errors = ref(emptyErrors())
const submittedCards = ref([])
const reasonFeedback = ref('')

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) {
      errors.value.username = 'Name must be at least 3 characters.'
    }
    return
  }

  errors.value.username = null
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) {
      errors.value.password = `Password must be at least ${minLength} characters long.`
    }
  } else if (!hasUppercase) {
    if (blur) {
      errors.value.password = 'Password must contain at least one uppercase letter.'
    }
  } else if (!hasLowercase) {
    if (blur) {
      errors.value.password = 'Password must contain at least one lowercase letter.'
    }
  } else if (!hasNumber) {
    if (blur) {
      errors.value.password = 'Password must contain at least one number.'
    }
  } else if (!hasSpecialChar) {
    if (blur) {
      errors.value.password = 'Password must contain at least one special character.'
    }
  } else {
    errors.value.password = null
  }
}

const validateConfirmPassword = (blur) => {
  const password = formData.value.password
  const confirmPassword = formData.value.confirmPassword

  if (!confirmPassword) {
    if (blur) {
      errors.value.confirmPassword = 'Please confirm your password.'
    }
  } else if (password !== confirmPassword) {
    if (blur) {
      errors.value.confirmPassword = 'Passwords do not match.'
    }
  } else {
    errors.value.confirmPassword = null
  }
}

const validateReason = () => {
  const containsFriend = /\bfriend\b/i.test(formData.value.reason)
  reasonFeedback.value = containsFriend ? 'Great to have a friend' : ''
}

const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateConfirmPassword(true)

  const formIsValid =
    !errors.value.username &&
    !errors.value.password &&
    !errors.value.confirmPassword

  if (formIsValid) {
    const { confirmPassword, ...submittedUser } = formData.value
    submittedCards.value.push(submittedUser)
    clearForm()
  }
}

const clearForm = () => {
  formData.value = emptyFormData()
  errors.value = emptyErrors()
  reasonFeedback.value = ''
}
</script>

<template>
  <section class="container mt-5 registration-page">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">W5. Library Registration Form</h1>
        <p class="text-center text-muted">
          Register for library membership and review submitted registrations below.
        </p>

        <form @submit.prevent="submitForm">
          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="username" class="form-label">Username</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                class="form-control"
                @blur="() => validateName(true)"
                @input="() => validateName(false)"
              />
              <div v-if="errors.username" class="text-danger mt-1">
                {{ errors.username }}
              </div>
            </div>

            <div class="col-md-6 col-sm-6">
              <label for="password" class="form-label">Password</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-control"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
              />
              <div v-if="errors.password" class="text-danger mt-1">
                {{ errors.password }}
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6 col-sm-6">
              <label for="confirm-password" class="form-label">Confirm password</label>
              <input
                id="confirm-password"
                v-model="formData.confirmPassword"
                type="password"
                class="form-control"
                @blur="() => validateConfirmPassword(true)"
                @input="() => validateConfirmPassword(false)"
              />
              <div v-if="errors.confirmPassword" class="text-danger mt-1">
                {{ errors.confirmPassword }}
              </div>
            </div>

            <div class="col-md-6 col-sm-6">
              <label for="suburb" class="form-label">Suburb</label>
              <input
                id="suburb"
                :value="formData.suburb"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6 col-sm-6 d-flex align-items-end">
              <div class="form-check mb-2">
                <input
                  id="isAustralian"
                  v-model="formData.isAustralian"
                  type="checkbox"
                  class="form-check-input"
                />
                <label class="form-check-label" for="isAustralian">Australian Resident?</label>
              </div>
            </div>

            <div class="col-md-6 col-sm-6">
              <label for="gender" class="form-label">Gender</label>
              <select id="gender" v-model="formData.gender" class="form-select" required>
                <option disabled value="">Select an option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label for="reason" class="form-label">Reason for joining</label>
            <textarea
              id="reason"
              v-model="formData.reason"
              class="form-control"
              rows="3"
              @input="validateReason"
            ></textarea>
            <div v-if="reasonFeedback" class="text-success mt-1">
              {{ reasonFeedback }}
            </div>
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col-12">
        <h2 class="h4">Submitted registrations</h2>
        <DataTable :value="submittedCards" table-style="min-width: 50rem">
          <Column field="username" header="Username" />
          <Column field="password" header="Password" />
          <Column field="isAustralian" header="Australian Resident" />
          <Column field="gender" header="Gender" />
          <Column field="reason" header="Reason" />
        </DataTable>
      </div>
    </div>

    <div v-if="submittedCards.length" class="row mt-4">
      <div class="col-12 d-flex flex-wrap justify-content-start">
        <article v-for="(card, index) in submittedCards" :key="index" class="card m-2 user-card">
          <div class="card-header">User Information</div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Username: {{ card.username }}</li>
            <li class="list-group-item">Password: {{ card.password }}</li>
            <li class="list-group-item">
              Australian Resident: {{ card.isAustralian ? 'Yes' : 'No' }}
            </li>
            <li class="list-group-item">Gender: {{ card.gender }}</li>
            <li class="list-group-item">Reason: {{ card.reason }}</li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.registration-page {
  max-width: 1100px;
  padding-bottom: 3rem;
}

.user-card {
  width: 18rem;
}
</style>

```

---

## 6. Localhost Evidence: Home Page

The public Home route displays the navigation header, active Home link, complete Library Registration Form, Confirm password field, and submitted-registration DataTable.

### Localhost - Home Page

> **[INSERT HOME PAGE SCREENSHOT HERE]**<br>
> Capture `http://127.0.0.1:5174/` with the browser address bar visible. Include the active `Home (Week 5)` navigation link and as much of the complete form as possible.

---

## 7. Protected About Page

The About page is a protected members page. It becomes available only after successful authentication. When authentication succeeds, the Header reacts by showing the active About link and a Logout button.

### Localhost - About Page After Successful Login

> **[INSERT ABOUT PAGE SCREENSHOT HERE]**<br>
> Capture `http://127.0.0.1:5174/about` after login. Show the About page text, active About navigation link, and Logout button.

---

## 8. Custom Routing and Authentication Guard

The demonstration credentials are:

```text
Username: admin
Password: Library123!
```

### 8.1 Unauthenticated Access

When a user who is not logged in requests `/about`, the guard blocks the route and redirects to Access Denied. The original requested route is retained so that the user can return to `/about` after login.

### Custom Routing - Unauthenticated Access

> **[INSERT ACCESS DENIED SCREENSHOT HERE]**<br>
> Clear `sessionStorage`, refresh, and navigate directly to `http://127.0.0.1:5174/about`. Show `Access Denied` and `You must be logged in to view this page.`.

### 8.2 Successful Login and Redirect

`LoginView` calls `login()` from `auth.js` when the correct credentials are entered. The function updates reactive `isAuthenticated` state and saves the state to `sessionStorage`. The Login view returns the user to the requested protected route. The Header changes from Login to About and Logout without a page reload.

### Custom Routing - Successful Login

> **[INSERT SUCCESSFUL LOGIN / PROTECTED ABOUT SCREENSHOT HERE]**<br>
> Show the final `/about` page after login. The URL, protected-page confirmation message, About navigation item, and Logout button must be visible.

---

## 9. Testing Results

| Test | Procedure | Expected result | Result |
| --- | --- | --- | --- |
| Password mismatch | Enter `HelloWorld123%` and `HelloWorld123`, then blur Confirm password. | Red `Passwords do not match.` appears. | Pass |
| Confirmation on submit | Submit without a matching confirmation password. | Submission is prevented and an error appears. | Pass |
| Reason feedback | Enter `My friend recommended this library.` | Green `Great to have a friend` appears. | Pass |
| One-way binding | Change displayed Suburb from `Clayton` to `Melbourne`. | DevTools state remains `suburb: "Clayton"`. | Pass |
| Two-way binding | Enter `TestStudent` in Username. | DevTools shows `username: "TestStudent"`. | Pass |
| Unauthenticated route | Clear session storage and request `/about`. | Access Denied page is shown. | Pass |
| Invalid login | Submit incorrect credentials. | Error appears and user remains on Login. | Pass |
| Valid login | Submit `admin` / `Library123!`. | User is redirected to About. | Pass |
| Session persistence | Refresh authenticated About in the same tab. | Authentication remains active. | Pass |
| Logout | Select Logout and request `/about` again. | User returns to Login and About remains protected. | Pass |
| Production build | Run `npm run build`. | Vite completes and creates `dist/`. | Pass |

---

## 10. Conclusion

The completed application demonstrates Vue event handling, conditional rendering, `v-model`, one-way `v-bind`, component state inspection with Vue DevTools, client-side routing, and a global navigation guard. The registration form provides mismatch validation and responsive Reason feedback. The protected About route demonstrates unauthenticated access handling, login, redirect, session persistence, and logout.

---

## Appendix A: Additional Source Files

Start each file on a new PDF page. Copy the complete current content from the repository and use a readable monospaced font.

### File: `src/auth.js`

```js
import { ref } from 'vue'

const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'Library123!'

export const isAuthenticated = ref(sessionStorage.getItem('isAuthenticated') === 'true')

export const login = (username, password) => {
  const credentialsAreValid = username === DEMO_USERNAME && password === DEMO_PASSWORD

  if (credentialsAreValid) {
    isAuthenticated.value = true
    sessionStorage.setItem('isAuthenticated', 'true')
    return true
  }

  return false
}

export const logout = () => {
  isAuthenticated.value = false
  sessionStorage.removeItem('isAuthenticated')
}

```

### File: `src/views/LoginView.vue`

```vue
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

```

### File: `src/views/AccessDeniedView.vue`

```vue
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

```

### File: `src/components/BHeader.vue`

```vue
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

```

### File: `src/main.js`

```js
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})

app.use(router)

app.mount('#app')

```

---

## Final Submission Checklist

- [ ] Replace Student name, Student ID, and submission date.
- [ ] Replace every screenshot placeholder with the correct high-resolution screenshot.
- [ ] Insert the full `HomeView.vue` code at the marked location.
- [ ] Insert all Appendix A source files at their marked locations.
- [ ] Ensure each source-code file begins on a new PDF page.
- [ ] Ensure browser URLs, form labels, validation messages, and DevTools values are readable.
- [ ] Export all pages as one PDF named `StudentID_FamilyName_FIT5032_AssessedLab5.pdf`.
