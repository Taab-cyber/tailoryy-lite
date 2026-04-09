// services/firebase.js — Firebase initialization for Google auth
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Only initialize if config is present and not placeholder
const isConfigured = (
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'placeholder' &&
  !firebaseConfig.apiKey.includes('your-') &&
  firebaseConfig.apiKey.startsWith('AIza')
)
let app, auth, googleProvider

if (isConfigured) {
  app            = initializeApp(firebaseConfig)
  auth           = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.addScope('email')
  googleProvider.addScope('profile')
}

export async function signInWithGoogle() {
  if (!isConfigured) {
    throw new Error('Firebase not configured. Add VITE_FIREBASE_* env variables.')
  }
  const result = await signInWithPopup(auth, googleProvider)
  const idToken = await result.user.getIdToken()
  return idToken
}

export async function firebaseLogout() {
  if (auth) await signOut(auth)
}

export { auth }
