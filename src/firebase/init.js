// Firebase initialisation for the Firestore lab.
// Initialises the Firebase App once and exposes a shared Firestore `db`
// instance. Other components import the default export instead of calling
// getFirestore() again.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBiVE-yf2NUeODSSyL7LFDByhq6UuqHK9c',
  authDomain: 'nomash-library-lab7.firebaseapp.com',
  projectId: 'nomash-library-lab7',
  storageBucket: 'nomash-library-lab7.firebasestorage.app',
  messagingSenderId: '1021775219448',
  appId: '1:1021775219448:web:ce0f07b8af67a30dbdc90d'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default db
