import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  where,
  increment,
  getDoc,
  setDoc,
  deleteDoc,
  limit,
  startAfter,
  documentId
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { getAuth, getIdToken } from 'firebase/auth'

export interface Photo {
  id: string
  title?: string
  description?: string
  imageURL: string
  temporary: boolean
  visits: number
  likes: number
  timestamp: Date
  userId: string
  authorName: string // Added for denormalization
  location?: {
    lat: number
    lng: number
  }
}

export const useGalleryStore = defineStore('gallery', () => {
  const photos = ref<Photo[]>([])
  const loading = ref(false)
  const hasMorePhotos = ref(true)
  const lastPhotoDoc = ref(null)
  const PHOTOS_PER_PAGE = 10

  // Performance optimization: Cache for user names
  const userNameCache = ref(new Map<string, string>())

  // Performance optimization: Cache for photo states
  const photoStateCache = ref(new Map<string, { liked: boolean; saved: boolean }>())

  const loadPhotos = async (loadMore = false) => {
    if (loading.value || (!hasMorePhotos.value && loadMore)) return

    loading.value = true
    try {
      let q = query(
        collection(db, 'photos'), 
        orderBy('timestamp', 'desc'),
        limit(PHOTOS_PER_PAGE)
      )

      // If loading more, start after the last document
      if (loadMore && lastPhotoDoc.value) {
        q = query(
          collection(db, 'photos'), 
          orderBy('timestamp', 'desc'),
          startAfter(lastPhotoDoc.value),
          limit(PHOTOS_PER_PAGE)
        )
      }

      const querySnapshot = await getDocs(q)
      
      const newPhotos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Photo[]

      if (loadMore) {
        photos.value = [...photos.value, ...newPhotos]
      } else {
        photos.value = newPhotos
      }

      // Update pagination state
      if (querySnapshot.docs.length < PHOTOS_PER_PAGE) {
        hasMorePhotos.value = false
      }
      
      if (querySnapshot.docs.length > 0) {
        lastPhotoDoc.value = querySnapshot.docs[querySnapshot.docs.length - 1]
      }

    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      loading.value = false
    }
  }

  const loadUserPhotos = async (userId: string) => {
    try {
      // Try the optimized query first (requires composite index)
      try {
        const q = query(
          collection(db, 'photos'), 
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        )
        const querySnapshot = await getDocs(q)
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as Photo[]
      } catch (indexError) {
        // If composite index doesn't exist, fall back to simpler query
        console.warn('Composite index not available, using fallback query. Please create the required index in Firebase Console.')
        
        const q = query(
          collection(db, 'photos'), 
          where('userId', '==', userId)
        )
        const querySnapshot = await getDocs(q)
        
        // Sort manually on the client side
        const userPhotos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as Photo[]
        
        // Sort by timestamp descending
        return userPhotos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      }
    } catch (error) {
      console.error('Error loading user photos:', error)
      return []
    }
  }

  const loadSavedPhotos = async (userId: string) => {
    try {
      console.log('Loading saved photos for user:', userId)
      
      // Step 1: Get all saved photo IDs for the user
      const q = query(
        collection(db, 'savedPhotos'),
        where('userId', '==', userId)
      )
      
      console.log('Executing savedPhotos query...')
      const querySnapshot = await getDocs(q)
      console.log('Found', querySnapshot.docs.length, 'saved photo records')
      
      const savedPhotoIds = querySnapshot.docs.map(doc => {
        console.log('Saved photo document:', doc.id, doc.data())
        return doc.data().photoId
      })

      if (savedPhotoIds.length === 0) {
        console.log('No saved photos found')
        return []
      }
      
      // Step 2: Batch fetch photos using 'in' queries (max 10 per query)
      const savedPhotos: Photo[] = []
      const batchSize = 10
      
      for (let i = 0; i < savedPhotoIds.length; i += batchSize) {
        const batch = savedPhotoIds.slice(i, i + batchSize)
        console.log(`Fetching batch ${Math.floor(i / batchSize) + 1}:`, batch)
        
        const batchQuery = query(
          collection(db, 'photos'),
          where(documentId(), 'in', batch)
        )
        
        const batchSnapshot = await getDocs(batchQuery)
        const batchPhotos = batchSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as Photo[]
        
        savedPhotos.push(...batchPhotos)
      }
      
      console.log('Loaded', savedPhotos.length, 'saved photos')
      
      // Sort by timestamp descending
      return savedPhotos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } catch (error) {
      console.error('Error loading saved photos:', error)
      console.error('Error details:', error.code, error.message)
      
      // Provide more specific error information
      if (error.code === 'permission-denied') {
        console.error('Permission denied - check Firebase security rules and authentication status')
      }
      
      return []
    }
  }

  const getPhotoById = async (id: string): Promise<Photo | null> => {
    try {
      // First check if photo is already in local state
      const localPhoto = photos.value.find(photo => photo.id === id)
      if (localPhoto) return localPhoto

      // If not found locally, fetch from Firestore
      const docRef = doc(db, 'photos', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const photoData = {
          id: docSnap.id,
          ...docSnap.data(),
          timestamp: docSnap.data().timestamp?.toDate() || new Date()
        } as Photo
        
        // Add to local state
        photos.value.unshift(photoData)
        return photoData
      }
      
      return null
    } catch (error) {
      console.error('Error getting photo by ID:', error)
      return null
    }
  }

  const incrementVisits = async (id: string) => {
    try {
      const photoRef = doc(db, 'photos', id)
      await updateDoc(photoRef, {
        visits: increment(1)
      })
      
      // Update local state
      const photo = photos.value.find(p => p.id === id)
      if (photo) {
        photo.visits++
      }
    } catch (error) {
      console.error('Error incrementing visits:', error)
    }
  }

  const toggleLike = async (photoId: string): Promise<boolean> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('User not authenticated')
      
      // Check cache first
      const cacheKey = `${userId}_${photoId}`
      const cached = photoStateCache.value.get(cacheKey)
      
      const likeRef = doc(db, 'likes', cacheKey)
      const likeDoc = await getDoc(likeRef)
      
      const photoRef = doc(db, 'photos', photoId)
      
      if (likeDoc.exists()) {
        // Unlike: remove like document and decrement likes count
        await deleteDoc(likeRef)
        await updateDoc(photoRef, {
          likes: increment(-1)
        })
        
        // Update local state - ensure likes never go below 0
        const photo = photos.value.find(p => p.id === photoId)
        if (photo) {
          photo.likes = Math.max(0, photo.likes - 1)
        }
        
        // Update cache
        photoStateCache.value.set(cacheKey, { ...cached, liked: false })
        
        return false // Not liked anymore
      } else {
        // Like: create like document and increment likes count
        await setDoc(likeRef, {
          userId,
          photoId,
          timestamp: new Date()
        })
        await updateDoc(photoRef, {
          likes: increment(1)
        })
        
        // Update local state
        const photo = photos.value.find(p => p.id === photoId)
        if (photo) {
          photo.likes++
        }
        
        // Update cache
        photoStateCache.value.set(cacheKey, { ...cached, liked: true })
        
        return true // Now liked
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  const isPhotoLiked = async (photoId: string): Promise<boolean> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) return false
      
      // Check cache first
      const cacheKey = `${userId}_${photoId}`
      const cached = photoStateCache.value.get(cacheKey)
      if (cached !== undefined) {
        return cached.liked
      }
      
      const likeRef = doc(db, 'likes', cacheKey)
      const likeDoc = await getDoc(likeRef)
      const isLiked = likeDoc.exists()
      
      // Update cache
      photoStateCache.value.set(cacheKey, { liked: isLiked, saved: cached?.saved || false })
      
      return isLiked
    } catch (error) {
      console.error('Error checking if photo is liked:', error)
      return false
    }
  }

  const savePhoto = async (photoId: string) => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('User not authenticated')
      
      const saveRef = doc(db, 'savedPhotos', `${userId}_${photoId}`)
      await setDoc(saveRef, {
        userId,
        photoId,
        timestamp: new Date()
      })
      
      // Update cache
      const cacheKey = `${userId}_${photoId}`
      const cached = photoStateCache.value.get(cacheKey)
      photoStateCache.value.set(cacheKey, { ...cached, saved: true })
    } catch (error) {
      console.error('Error saving photo:', error)
      throw error
    }
  }

  const unsavePhoto = async (photoId: string) => {
    try {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('User not authenticated')
      
      const saveRef = doc(db, 'savedPhotos', `${userId}_${photoId}`)
      await deleteDoc(saveRef)
      
      // Update cache
      const cacheKey = `${userId}_${photoId}`
      const cached = photoStateCache.value.get(cacheKey)
      photoStateCache.value.set(cacheKey, { ...cached, saved: false })
    } catch (error) {
      console.error('Error unsaving photo:', error)
      throw error
    }
  }

  const isPhotoSaved = async (photoId: string): Promise<boolean> => {
    try {
      const userId = getCurrentUserId()
      if (!userId) return false
      
      // Check cache first
      const cacheKey = `${userId}_${photoId}`
      const cached = photoStateCache.value.get(cacheKey)
      if (cached !== undefined) {
        return cached.saved
      }
      
      const saveRef = doc(db, 'savedPhotos', cacheKey)
      const saveDoc = await getDoc(saveRef)
      const isSaved = saveDoc.exists()
      
      // Update cache
      photoStateCache.value.set(cacheKey, { saved: isSaved, liked: cached?.liked || false })
      
      return isSaved
    } catch (error) {
      console.error('Error checking if photo is saved:', error)
      return false
    }
  }

  const extractStoragePathFromURL = (downloadURL: string): string | null => {
    try {
      console.log('🔗 Processing URL:', downloadURL)
      
      const url = new URL(downloadURL)
      
      // Check if it's a Firebase Storage URL
      if (!url.hostname.includes('firebasestorage.googleapis.com')) {
        console.warn('⚠️ URL is not a Firebase Storage URL')
        return null
      }
      
      // Extract the path from the URL
      // Firebase Storage URLs have the format:
      // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?...
      const pathMatch = url.pathname.match(/\/o\/(.+)/)
      
      if (!pathMatch) {
        console.warn('⚠️ Could not extract path from Firebase Storage URL')
        return null
      }
      
      // Decode the URL-encoded path
      const encodedPath = pathMatch[1]
      const decodedPath = decodeURIComponent(encodedPath)
      
      console.log('✅ Extracted storage path:', decodedPath)
      return decodedPath
    } catch (error) {
      console.error('❌ Error extracting storage path from URL:', error)
      return null
    }
  }

  // Enhanced deletePhoto function with soft delete for storage
  const deletePhoto = async (photoId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🗑️ Starting enhanced photo deletion with soft delete for storage:', photoId)
      
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      console.log('👤 Current user ID:', userId)
      
      // Refresh authentication token to ensure it's valid
      const authStore = useAuthStore()
      await authStore.refreshAuthToken()
      console.log('🔄 Auth token refreshed')
      
      // Get photo data first to check ownership and get image URL
      console.log('📄 Fetching photo document...')
      const photoDoc = await getDoc(doc(db, 'photos', photoId))
      if (!photoDoc.exists()) {
        throw new Error('Photo not found')
      }
      
      const photoData = photoDoc.data()
      console.log('📄 Photo data retrieved:', {
        userId: photoData.userId,
        imageURL: photoData.imageURL
      })
      
      // Check if user owns the photo
      if (photoData.userId !== userId) {
        throw new Error('You can only delete your own photos')
      }
      console.log('✅ Ownership verified')
      
      // Step 1: Add image to storage cleanup queue (soft delete)
      const imageURL = photoData.imageURL
      if (imageURL) {
        try {
          console.log('📝 Adding image to storage cleanup queue for delayed deletion...')
          
          await addDoc(collection(db, 'storageCleanupQueue'), {
            photoId: photoId,
            imageURL: imageURL,
            userId: userId,
            timestamp: new Date(),
            processed: false
          })
          
          console.log('✅ Image added to cleanup queue successfully')
        } catch (queueError) {
          console.error('❌ Error adding to cleanup queue:', queueError)
          // Continue with deletion even if queue addition fails
          console.warn('⚠️ Continuing with Firestore deletion despite queue error')
        }
      }
      
      console.log('🗑️ Starting comprehensive Firestore cleanup...')
      
      // Step 2: Delete all related likes
      console.log('❤️ Deleting all related likes...')
      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('photoId', '==', photoId)
        )
        const likesSnapshot = await getDocs(likesQuery)
        console.log(`❤️ Found ${likesSnapshot.docs.length} likes to delete`)
        
        const likeDeletePromises = likesSnapshot.docs.map(doc => {
          console.log(`❤️ Deleting like document: ${doc.id}`)
          return deleteDoc(doc.ref)
        })
        await Promise.all(likeDeletePromises)
        console.log('✅ All likes deleted')
      } catch (likesError) {
        console.error('❌ Error deleting likes:', likesError)
        // Continue with deletion even if likes cleanup fails
      }
      
      // Step 3: Delete all related saved photos
      console.log('💾 Deleting all related saved photos...')
      try {
        const savedQuery = query(
          collection(db, 'savedPhotos'),
          where('photoId', '==', photoId)
        )
        const savedSnapshot = await getDocs(savedQuery)
        console.log(`💾 Found ${savedSnapshot.docs.length} saved photos to delete`)
        
        const savedDeletePromises = savedSnapshot.docs.map(doc => {
          console.log(`💾 Deleting saved photo document: ${doc.id}`)
          return deleteDoc(doc.ref)
        })
        await Promise.all(savedDeletePromises)
        console.log('✅ All saved photos deleted')
      } catch (savedError) {
        console.error('❌ Error deleting saved photos:', savedError)
        // Continue with deletion even if saved photos cleanup fails
      }
      
      // Step 4: Delete the photo document itself
      console.log('📄 Deleting photo document...')
      await deleteDoc(doc(db, 'photos', photoId))
      console.log('✅ Photo document deleted')
      
      // Step 5: Update local state immediately
      console.log('🔄 Updating local state...')
      const photoIndex = photos.value.findIndex(p => p.id === photoId)
      if (photoIndex !== -1) {
        photos.value.splice(photoIndex, 1)
        console.log('✅ Photo removed from main photos array')
      }
      
      // Clear cache entries for this photo
      const keysToDelete = Array.from(photoStateCache.value.keys()).filter(key => key.endsWith(`_${photoId}`))
      keysToDelete.forEach(key => photoStateCache.value.delete(key))
      
      // Step 6: Force refresh photos from server to ensure consistency
      console.log('🔄 Refreshing photos from server...')
      await loadPhotos()
      console.log('✅ Photos refreshed from server')
      
      console.log('🎉 Enhanced photo deletion completed successfully!')
      console.log('📝 Note: Image will be deleted from Firebase Storage by the cleanup service within 24 hours')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Error deleting photo:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      })
      
      let errorMessage = error.message || 'Failed to delete photo'
      
      // Provide specific error messages
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.'
      } else if (error.message?.includes('User not authenticated')) {
        errorMessage = 'Authentication required. Please sign in again.'
      } else if (error.message?.includes('You can only delete your own photos')) {
        errorMessage = 'You can only delete your own photos.'
      } else if (error.message?.includes('Photo not found')) {
        errorMessage = 'Photo not found or already deleted.'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const getCurrentUserId = () => {
    // Get current user from Firebase Auth directly
    const auth = getAuth()
    return auth.currentUser?.uid || null
  }

  const uploadImage = async (file: File, userId: string): Promise<string> => {
    try {
      console.log('Starting image upload to Firebase Storage...')
      
      // Verify user is authenticated
      const auth = getAuth()
      if (!auth.currentUser) {
        throw new Error('User not authenticated')
      }
      
      // Verify the userId matches the current user
      if (auth.currentUser.uid !== userId) {
        throw new Error('User ID mismatch')
      }
      
      // Get fresh auth token to ensure permissions are up to date
      console.log('Getting fresh authentication token...')
      const token = await getIdToken(auth.currentUser, true)
      console.log('Fresh auth token obtained, length:', token.length)
      
      // Wait a moment for the token to propagate
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const timestamp = Date.now()
      const fileName = `${userId}_${timestamp}.jpg`
      const imageRef = storageRef(storage, `images/${userId}/${fileName}`)
      
      console.log('Uploading to path:', `images/${userId}/${fileName}`)
      console.log('Current user UID:', auth.currentUser.uid)
      
      const snapshot = await uploadBytes(imageRef, file)
      console.log('Upload completed, getting download URL...')
      
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log('Download URL obtained:', downloadURL)
      
      return downloadURL
    } catch (error: any) {
      console.error('Error uploading image:', error)
      
      // Provide more specific error messages for storage issues
      if (error.code === 'storage/unauthorized') {
        throw new Error('Storage permission denied. Please sign out and sign back in to refresh your authentication.')
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('Storage quota exceeded. Please contact support.')
      } else if (error.code === 'storage/invalid-format') {
        throw new Error('Invalid image format. Please select a valid image file.')
      } else if (error.code === 'storage/object-not-found') {
        throw new Error('Upload failed. Please try again.')
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your internet connection and try again.')
      }
      
      throw new Error(`Image upload failed: ${error.message || 'Unknown error'}`)
    }
  }

  const addPhoto = async (photoData: Omit<Photo, 'id' | 'visits' | 'likes' | 'timestamp' | 'authorName'>, imageFile: File) => {
    try {
      console.log('Starting photo upload process...')
      console.log('Photo data:', photoData)
      console.log('User ID:', photoData.userId)
      
      // Verify user is authenticated
      const auth = getAuth()
      if (!auth.currentUser) {
        throw new Error('User not authenticated. Please sign in and try again.')
      }
      
      // Verify the userId matches the current user
      if (auth.currentUser.uid !== photoData.userId) {
        throw new Error('User ID mismatch. Please sign out and sign back in.')
      }
      
      console.log('Authentication verified. Current user UID:', auth.currentUser.uid)
      
      // Force refresh the auth token to ensure it's valid
      try {
        console.log('Refreshing authentication token...')
        const token = await getIdToken(auth.currentUser, true)
        console.log('Fresh auth token obtained successfully')
        
        // Wait a moment for the token to propagate
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError)
        throw new Error('Authentication token expired. Please sign out and sign back in.')
      }
      
      // Get user's name for denormalization (check cache first)
      console.log('Getting user name for denormalization...')
      let authorName = userNameCache.value.get(photoData.userId)
      if (!authorName) {
        const userDoc = await getDoc(doc(db, 'users', photoData.userId))
        if (userDoc.exists()) {
          authorName = userDoc.data().name || 'Anonymous'
          userNameCache.value.set(photoData.userId, authorName)
        } else {
          authorName = 'Anonymous'
        }
      }
      console.log('Author name:', authorName)
      
      // Upload image first
      console.log('Uploading image file...')
      const imageURL = await uploadImage(imageFile, photoData.userId)
      console.log('Image uploaded successfully, URL:', imageURL)
      
      // Create photo document with denormalized author name
      const newPhoto = {
        ...photoData,
        imageURL,
        authorName, // Denormalized user name
        visits: 0,
        likes: 0,
        timestamp: new Date()
      }
      
      console.log('Creating photo document in Firestore...')
      console.log('Document data:', newPhoto)
      
      const docRef = await addDoc(collection(db, 'photos'), newPhoto)
      console.log('Photo document created with ID:', docRef.id)
      
      // Add to local state
      const photoWithId = {
        ...newPhoto,
        id: docRef.id
      }
      photos.value.unshift(photoWithId)
      
      console.log('Photo added to local state successfully')
      return { success: true, photoId: docRef.id }
    } catch (error: any) {
      console.error('Error adding photo:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      
      // Provide more specific error messages
      let errorMessage = 'Upload failed. Please try again.'
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please sign out and sign back in to refresh your authentication. Also verify that localhost is in your Firebase authorized domains.'
      } else if (error.code === 'unauthenticated') {
        errorMessage = 'Authentication required. Please sign out and sign back in.'
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Invalid data provided. Please check your input and try again.'
      } else if (error.message?.includes('Missing or insufficient permissions')) {
        errorMessage = 'Permission denied. Please sign out and sign back in. Also verify that localhost is in your Firebase authorized domains.'
      } else if (error.message?.includes('User not authenticated')) {
        errorMessage = 'Authentication expired. Please sign out and sign back in.'
      } else if (error.message?.includes('User ID mismatch')) {
        errorMessage = 'Authentication error. Please sign out and sign back in.'
      } else if (error.message?.includes('Authentication token expired')) {
        errorMessage = 'Authentication token expired. Please sign out and sign back in.'
      } else if (error.message?.includes('storage/unauthorized')) {
        errorMessage = 'Storage permission denied. Please check Firebase Storage security rules.'
      } else if (error.message?.includes('storage/quota-exceeded')) {
        errorMessage = 'Storage quota exceeded. Please contact support.'
      } else if (error.message?.includes('storage/invalid-format')) {
        errorMessage = 'Invalid image format. Please select a valid image file.'
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const getUserName = async (userId: string): Promise<string> => {
    try {
      // Check cache first
      const cached = userNameCache.value.get(userId)
      if (cached) {
        return cached
      }

      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const name = userDoc.data().name || 'Anonymous'
        userNameCache.value.set(userId, name)
        return name
      }
      return 'Anonymous'
    } catch (error) {
      console.error('Error getting user name:', error)
      return 'Anonymous'
    }
  }

  // Reset pagination state
  const resetPagination = () => {
    photos.value = []
    hasMorePhotos.value = true
    lastPhotoDoc.value = null
  }

  // Performance optimization: Clear caches
  const clearCaches = () => {
    userNameCache.value.clear()
    photoStateCache.value.clear()
  }

  return {
    photos,
    loading,
    hasMorePhotos,
    loadPhotos,
    loadUserPhotos,
    loadSavedPhotos,
    getPhotoById,
    incrementVisits,
    addPhoto,
    deletePhoto,
    getUserName,
    savePhoto,
    unsavePhoto,
    isPhotoSaved,
    toggleLike,
    isPhotoLiked,
    resetPagination,
    clearCaches
  }
})

// Import useAuthStore at the bottom to avoid circular dependency
import { useAuthStore } from './auth'