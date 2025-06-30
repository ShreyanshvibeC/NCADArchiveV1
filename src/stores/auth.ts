import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

interface UserProfile {
  id: string
  email: string
  name: string
  bio?: string
  uploadCount: number
  createdAt: Date
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(true)
  const authToken = ref<string | null>(null)

  // Validate NCAD email domain
  const validateNCADEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('.ncad.ie')
  }

  // Initialize auth state listener
  const initializeAuth = () => {
    onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        console.log('Firebase user authenticated:', firebaseUser.uid)
        isAuthenticated.value = true
        
        // Get fresh auth token
        try {
          authToken.value = await getIdToken(firebaseUser, true)
          console.log('Auth token obtained successfully')
        } catch (error) {
          console.error('Error getting auth token:', error)
        }
        
        await loadUserProfile(firebaseUser.uid, firebaseUser)
      } else {
        console.log('No Firebase user found')
        user.value = null
        isAuthenticated.value = false
        authToken.value = null
      }
      loading.value = false
    })
  }

  const loadUserProfile = async (uid: string, firebaseUser?: User) => {
    try {
      console.log('Loading user profile for:', uid)
      const userDoc = await getDoc(doc(db, 'users', uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        user.value = {
          id: uid,
          email: userData.email,
          name: userData.name,
          bio: userData.bio,
          uploadCount: userData.uploadCount || 0,
          createdAt: userData.createdAt?.toDate() || new Date()
        }
        console.log('User profile loaded successfully:', user.value)
      } else {
        console.log('User document does not exist, creating from Firebase Auth data')
        // Create user profile from Firebase Auth data if document doesn't exist
        if (firebaseUser) {
          const newUserProfile = {
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            uploadCount: 0,
            createdAt: new Date()
          }
          
          try {
            await setDoc(doc(db, 'users', uid), newUserProfile)
            user.value = {
              id: uid,
              ...newUserProfile
            }
            console.log('Created new user profile:', user.value)
          } catch (createError) {
            console.error('Error creating user profile:', createError)
            // Fallback to minimal profile
            user.value = {
              id: uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              uploadCount: 0,
              createdAt: new Date()
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error)
      
      // If we have Firebase user data, create a minimal profile
      if (firebaseUser) {
        user.value = {
          id: uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          uploadCount: 0,
          createdAt: new Date()
        }
        console.log('Created fallback user profile:', user.value)
      }
    }
  }

  const refreshAuthToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null
    
    try {
      authToken.value = await getIdToken(auth.currentUser, true)
      console.log('Auth token refreshed successfully')
      return authToken.value
    } catch (error) {
      console.error('Error refreshing auth token:', error)
      return null
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email)
      
      // Validate NCAD email domain
      if (!validateNCADEmail(email)) {
        return { 
          success: false, 
          error: 'Access is limited to NCAD email accounts. Please use your NCAD email to continue.' 
        }
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Get fresh auth token
      authToken.value = await getIdToken(userCredential.user, true)
      console.log('Login successful, loading profile...')
      
      await loadUserProfile(userCredential.user.uid, userCredential.user)
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      
      let userFriendlyMessage = 'Login failed. Please try again.'
      
      if (error.code === 'auth/user-not-found') {
        userFriendlyMessage = 'We couldn\'t find an account with that email. Please check and try again.'
      } else if (error.code === 'auth/wrong-password') {
        userFriendlyMessage = 'Incorrect password. Please try again.'
      } else if (error.code === 'auth/invalid-email') {
        userFriendlyMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/invalid-credential') {
        userFriendlyMessage = 'Email or password is incorrect. Please check your details and try again.'
      } else if (error.code === 'auth/user-disabled') {
        userFriendlyMessage = 'This account has been disabled.'
      } else if (error.code === 'auth/too-many-requests') {
        userFriendlyMessage = 'Too many failed attempts. Please try again later.'
      }
      
      return { success: false, error: userFriendlyMessage }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting registration for:', email)
      
      // Validate NCAD email domain
      if (!validateNCADEmail(email)) {
        return { 
          success: false, 
          error: 'Accounts can only be created with an NCAD email. Please use your NCAD email.' 
        }
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Get fresh auth token
      authToken.value = await getIdToken(userCredential.user, true)
      
      // Create user profile in Firestore
      const userProfile = {
        email,
        name,
        uploadCount: 0,
        createdAt: new Date()
      }
      
      console.log('Creating user profile in Firestore...')
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile)
      await loadUserProfile(userCredential.user.uid, userCredential.user)
      
      console.log('Registration completed successfully')
      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      
      let userFriendlyMessage = 'Registration failed. Please try again.'
      
      if (error.code === 'auth/email-already-in-use') {
        userFriendlyMessage = 'An account with this email already exists.'
      } else if (error.code === 'auth/invalid-email') {
        userFriendlyMessage = 'Please enter a valid email address.'
      } else if (error.code === 'auth/weak-password') {
        userFriendlyMessage = 'Password is too weak. Please choose a stronger password.'
      } else if (error.code === 'auth/operation-not-allowed') {
        userFriendlyMessage = 'Email/password accounts are not enabled.'
      }
      
      return { success: false, error: userFriendlyMessage }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      isAuthenticated.value = false
      authToken.value = null
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'name' | 'bio'>>) => {
    if (!user.value) return { success: false, error: 'Not authenticated' }
    
    try {
      await setDoc(doc(db, 'users', user.value.id), updates, { merge: true })
      user.value = { ...user.value, ...updates }
      return { success: true }
    } catch (error: any) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }
  }

  const incrementUploadCount = async () => {
    if (!user.value) return
    
    try {
      const newCount = user.value.uploadCount + 1
      await updateDoc(doc(db, 'users', user.value.id), { uploadCount: increment(1) })
      user.value.uploadCount = newCount
      console.log('Upload count incremented to:', newCount)
    } catch (error) {
      console.error('Error incrementing upload count:', error)
    }
  }

  const decrementUploadCount = async () => {
    if (!user.value) return
    
    try {
      const newCount = Math.max(0, user.value.uploadCount - 1)
      await updateDoc(doc(db, 'users', user.value.id), { uploadCount: increment(-1) })
      user.value.uploadCount = newCount
      console.log('Upload count decremented to:', newCount)
    } catch (error) {
      console.error('Error decrementing upload count:', error)
    }
  }

  // Sync upload count with actual photos in database
  const syncUploadCount = async (actualPhotoCount: number) => {
    if (!user.value) return
    
    try {
      // Only update if there's a discrepancy
      if (user.value.uploadCount !== actualPhotoCount) {
        console.log(`Syncing upload count from ${user.value.uploadCount} to ${actualPhotoCount}`)
        await updateDoc(doc(db, 'users', user.value.id), { uploadCount: actualPhotoCount })
        user.value.uploadCount = actualPhotoCount
        console.log('Upload count synced to:', actualPhotoCount)
      }
    } catch (error) {
      console.error('Error syncing upload count:', error)
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    authToken,
    initializeAuth,
    login,
    register,
    logout,
    updateProfile,
    incrementUploadCount,
    decrementUploadCount,
    syncUploadCount,
    refreshAuthToken,
    validateNCADEmail
  }
})