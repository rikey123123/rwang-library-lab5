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
