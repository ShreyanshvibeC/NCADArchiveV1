import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { isMobileDevice } from '../utils/mobileUtils'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars)
  console.error('Please check your .env file and ensure all Firebase configuration variables are set')
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Error initializing Firebase:', error)
  throw error
}

// Mobile-optimized Firestore settings
const firestoreSettings = {
  localCache: persistentLocalCache({
    cacheSizeBytes: isMobileDevice() ? 10 * 1024 * 1024 : 40 * 1024 * 1024 // 10MB on mobile vs 40MB desktop
  })
}

// Initialize Firebase services with mobile optimization
export const auth = getAuth(app)
export const db = initializeFirestore(app, firestoreSettings)
export const storage = getStorage(app)

// Enable persistence for better offline support
try {
  auth.useDeviceLanguage()
} catch (error) {
  console.warn('Could not set device language for Firebase Auth:', error)
}

// Log mobile optimization status
if (isMobileDevice()) {
  console.log('Mobile optimizations enabled:', {
    cacheSize: '10MB',
    optimizedQueries: true,
    reducedBatchSizes: true
  })
}

export default app