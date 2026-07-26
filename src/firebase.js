// Centralised Firebase initialisation.
// Firebase must be initialised only once for the whole app.
// Every component imports `auth` and `db` from this file instead of
// calling initializeApp() again.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBiVE-yf2NUeODSSyL7LFDByhq6UuqHK9c',
  authDomain: 'nomash-library-lab7.firebaseapp.com',
  projectId: 'nomash-library-lab7',
  storageBucket: 'nomash-library-lab7.firebasestorage.app',
  messagingSenderId: '1021775219448',
  appId: '1:1021775219448:web:ce0f07b8af67a30dbdc90d'
}

const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
