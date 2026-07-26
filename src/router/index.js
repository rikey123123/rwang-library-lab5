import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { auth, db } from '@/firebase'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import FirebaseRegisterView from '@/views/FirebaseRegisterView.vue'
import FirebaseSigninView from '@/views/FirebaseSigninView.vue'
import ReaderDashboardView from '@/views/ReaderDashboardView.vue'
import LibrarianDashboardView from '@/views/LibrarianDashboardView.vue'
import LogoutView from '@/views/LogoutView.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/FireRegister',
    name: 'fire-register',
    component: FirebaseRegisterView
  },
  {
    path: '/FireLogin',
    name: 'fire-login',
    component: FirebaseSigninView
  },
  {
    path: '/reader',
    name: 'reader-dashboard',
    component: ReaderDashboardView,
    meta: {
      requiresAuth: true,
      role: 'reader'
    }
  },
  {
    path: '/librarian',
    name: 'librarian-dashboard',
    component: LibrarianDashboardView,
    meta: {
      requiresAuth: true,
      role: 'librarian'
    }
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogoutView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Resolve the current Firebase user as a promise. Firebase Auth may still be
// initialising right after a page refresh, so we wait for onAuthStateChanged
// instead of reading auth.currentUser synchronously.
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to) => {
  const user = await getCurrentUser()

  if (to.meta.requiresAuth && !user) {
    return {
      name: 'fire-login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.meta.role && user) {
    const userSnapshot = await getDoc(doc(db, 'users', user.uid))
    const userRole = userSnapshot.exists() ? userSnapshot.data().role : null

    if (userRole !== to.meta.role) {
      return { name: 'unauthorized' }
    }
  }

  return true
})

export default router
