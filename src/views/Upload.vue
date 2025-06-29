<template>
  <div class="min-h-screen bg-black p-4">
    <!-- Header -->
    <header class="flex items-center justify-between bg-black py-4">
      <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none">Upload Photo</h1>

      <div class="w-6"></div>
    </header>

    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-8">
      <!-- Authentication Check -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-12">
        <p class="text-gray-400 mb-4">Please sign in to upload photos</p>
        <div class="space-y-3">
          <router-link 
            to="/login" 
            class="block bg-ncad-yellow text-black px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
          >
            Sign In
          </router-link>
          <router-link 
            to="/signup" 
            class="block bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-all border border-gray-600"
          >
            Create Account
          </router-link>
        </div>
      </div>

      <!-- Upload Limit Check -->
      <div v-else-if="authStore.user && authStore.user.uploadCount >= 25" class="text-center py-12">
        <div class="bg-ncad-yellow bg-opacity-20 border border-ncad-yellow p-4 mb-4">
          <p class="text-ncad-yellow">
            You've reached the upload limit of 25 photos. Delete some photos to upload new ones.
          </p>
        </div>
        <router-link 
          to="/profile" 
          class="bg-ncad-yellow text-black px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
        >
          Manage Photos
        </router-link>
      </div>

      <!-- Upload Interface -->
      <div v-else>
        <!-- Upload Area -->
        <div v-if="!selectedImage" class="border-2 border-dashed border-gray-600 p-12 text-center mb-8">
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            capture="environment"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <div class="space-y-4">
            <svg class="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            
            <div>
              <button 
                @click="fileInput?.click()"
                class="bg-ncad-yellow text-black px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
              >
                Take Photo
              </button>
              <p class="text-gray-400 text-sm mt-2">or select from device</p>
            </div>
          </div>
        </div>

        <!-- Preview and Form -->
        <div v-if="selectedImage" class="space-y-6">
          <!-- Image Preview - 1:1 aspect ratio -->
          <div class="relative">
            <img :src="previewUrl" alt="Preview" class="w-full aspect-square object-cover" />
            <button 
              @click="clearSelection"
              class="absolute top-4 right-4 bg-gray-900 bg-opacity-75 p-2 hover:bg-opacity-100 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="uploadPhoto" class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-2">Title (optional)</label>
              <input 
                v-model="title"
                type="text" 
                class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none transition-colors"
                placeholder="Enter a title for your photo"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">
                Description (optional) - Max 50 characters
              </label>
              <textarea 
                v-model="description"
                rows="3"
                maxlength="50"
                class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none resize-none transition-colors"
                :class="{ 'border-red-500': descriptionError }"
                placeholder="Describe your photo (max 50 characters)"
              ></textarea>
              
              <!-- Character count and error message -->
              <div class="flex justify-between items-center mt-2">
                <div class="text-xs" :class="descriptionError ? 'text-red-400' : 'text-gray-400'">
                  {{ description.length }}/50 characters
                </div>
                <div v-if="descriptionError" class="text-red-400 text-xs">
                  Character limit exceeded
                </div>
              </div>
            </div>

            <!-- Include Location Checkbox -->
            <div class="flex items-center space-x-3">
              <input 
                id="location-checkbox"
                v-model="includeLocation"
                type="checkbox"
                class="w-4 h-4 bg-black border border-gray-600 focus:border-white focus:outline-none"
              />
              <label for="location-checkbox" class="text-sm font-medium text-white cursor-pointer">
                Include location information
              </label>
            </div>

            <!-- Temporary Photo Checkbox -->
            <div class="flex items-center space-x-3">
              <input 
                id="temporary-checkbox"
                v-model="isTemporary"
                type="checkbox"
                class="w-4 h-4 bg-black border border-gray-600 focus:border-white focus:outline-none"
              />
              <label for="temporary-checkbox" class="text-sm font-medium text-white cursor-pointer">
                Check this if the object or artwork in the photo is temporary and may not be there later
              </label>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="bg-ncad-yellow bg-opacity-20 border border-ncad-yellow p-3">
              <p class="text-ncad-yellow text-sm">{{ success }}</p>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="bg-red-900 bg-opacity-20 border border-red-500 p-3">
              <p class="text-red-400 text-sm">{{ error }}</p>
              <div v-if="showTroubleshooting" class="mt-3 text-xs text-red-400">
                <p class="font-medium mb-2">Troubleshooting steps:</p>
                <ol class="list-decimal list-inside space-y-1">
                  <li>Sign out and sign back in to refresh your authentication</li>
                  <li>Check that localhost is in Firebase Console > Authentication > Settings > Authorized domains</li>
                  <li>Verify Firestore Database security rules allow photo creation</li>
                  <li>Verify Storage security rules allow image uploads</li>
                  <li>Clear browser cache and cookies if the problem persists</li>
                </ol>
                <button 
                  @click="handleSignOut"
                  class="mt-3 bg-red-900 bg-opacity-20 text-red-400 px-4 py-2 text-xs hover:bg-opacity-30 transition-all"
                >
                  Sign Out & Try Again
                </button>
              </div>
            </div>

            <button 
              type="submit"
              :disabled="uploading || !selectedImage || !authStore.isAuthenticated || descriptionError"
              class="w-full bg-ncad-yellow text-black py-3 font-medium hover:bg-opacity-80 transition-all disabled:opacity-50"
            >
              {{ uploading ? 'Uploading...' : 'Upload Photo' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { compressImage, getCurrentLocation } from '../utils/imageUtils'
import { getAuth } from 'firebase/auth'

const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement>()
const selectedImage = ref<File | null>(null)
const previewUrl = ref('')
const title = ref('')
const description = ref('')
const isTemporary = ref(false)
const includeLocation = ref(false) // New checkbox for location
const uploading = ref(false)
const error = ref('')
const success = ref('')

// Computed property to check if upload is ready
const canUpload = computed(() => {
  return selectedImage.value && authStore.isAuthenticated && authStore.user && !uploading.value && !descriptionError.value
})

// Check if description exceeds character limit (changed to 50)
const descriptionError = computed(() => {
  return description.value.length > 50
})

// Show troubleshooting if error contains permission-related keywords
const showTroubleshooting = computed(() => {
  return error.value && (
    error.value.includes('Permission denied') || 
    error.value.includes('security rules') || 
    error.value.includes('Authentication') ||
    error.value.includes('unauthorized')
  )
})

// Watch description for character limit validation (changed to 50)
watch(description, (newValue) => {
  if (newValue.length > 50) {
    // Automatically trim to 50 characters
    description.value = newValue.substring(0, 50)
  }
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Clear previous errors
    error.value = ''
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select a valid image file'
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error.value = 'Image file is too large. Please select an image smaller than 10MB'
      return
    }
    
    selectedImage.value = file
    previewUrl.value = URL.createObjectURL(file)
    console.log('Image selected successfully:', file.name, 'Size:', file.size)
  }
}

const clearSelection = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedImage.value = null
  previewUrl.value = ''
  title.value = ''
  description.value = ''
  isTemporary.value = false
  includeLocation.value = false // Reset location checkbox
  error.value = ''
  success.value = ''
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSignOut = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    console.error('Error signing out:', err)
  }
}

const uploadPhoto = async () => {
  // Comprehensive validation
  if (!authStore.isAuthenticated) {
    error.value = 'You must be signed in to upload photos'
    return
  }
  
  if (!authStore.user) {
    error.value = 'User profile not loaded. Please try signing in again.'
    return
  }
  
  // Check Firebase Auth state
  const auth = getAuth()
  if (!auth.currentUser) {
    error.value = 'Authentication expired. Please sign out and sign back in.'
    return
  }
  
  // Verify user ID matches
  if (auth.currentUser.uid !== authStore.user.id) {
    error.value = 'Authentication mismatch. Please sign out and sign back in.'
    return
  }
  
  if (!selectedImage.value) {
    error.value = 'Please select an image to upload'
    return
  }
  
  // Check description character limit (changed to 50)
  if (description.value.length > 50) {
    error.value = 'Description must be 50 characters or less'
    return
  }
  
  uploading.value = true
  error.value = ''
  success.value = ''
  
  try {
    console.log('Starting upload process...')
    console.log('User authenticated:', authStore.isAuthenticated)
    console.log('User ID:', authStore.user.id)
    console.log('Firebase Auth UID:', auth.currentUser.uid)
    console.log('User email:', authStore.user.email)
    console.log('Image:', selectedImage.value.name)
    console.log('Is temporary:', isTemporary.value)
    console.log('Include location:', includeLocation.value)
    
    // Refresh auth token before upload
    console.log('Refreshing authentication token...')
    await authStore.refreshAuthToken()
    
    // Compress image to 1:1 aspect ratio
    console.log('Compressing image to 1:1 aspect ratio...')
    const compressedFile = await compressImage(selectedImage.value)
    console.log('Image compressed successfully. Original size:', selectedImage.value.size, 'Compressed size:', compressedFile.size)
    
    // Get location only if user wants to include it
    let location = null
    if (includeLocation.value) {
      console.log('Getting location...')
      location = await getCurrentLocation()
      if (location) {
        console.log('Location obtained:', location)
      } else {
        console.log('Location not available')
      }
    } else {
      console.log('Location not requested by user')
    }
    
    // Prepare photo data - use auth.currentUser.uid directly for userId
    const photoData: any = {
      temporary: isTemporary.value,
      userId: auth.currentUser.uid
    }
    
    // Only add title if it has a value
    const trimmedTitle = title.value.trim()
    if (trimmedTitle) {
      photoData.title = trimmedTitle
    }
    
    // Only add description if it has a value
    const trimmedDescription = description.value.trim()
    if (trimmedDescription) {
      photoData.description = trimmedDescription
    }
    
    // Only add location if user requested it and it's available
    if (includeLocation.value && location) {
      photoData.location = location
    }
    
    console.log('Uploading photo with data:', photoData)
    
    // Upload photo
    const result = await galleryStore.addPhoto(photoData, compressedFile)
    
    if (result.success) {
      console.log('Photo uploaded successfully, ID:', result.photoId)
      success.value = 'Photo uploaded successfully! Redirecting...'
      
      // Increment user upload count
      await authStore.incrementUploadCount()
      console.log('Upload count incremented')
      
      // Clear form
      clearSelection()
      
      // Redirect directly to home page after a short delay
      setTimeout(() => {
        console.log('Redirecting to home page...')
        router.push('/')
      }, 1000) // Reduced delay to 1 second for faster redirect
    } else {
      console.error('Upload failed:', result.error)
      error.value = result.error || 'Upload failed. Please try again.'
    }
  } catch (err: any) {
    console.error('Upload error:', err)
    console.error('Error details:', {
      code: err.code,
      message: err.message,
      stack: err.stack
    })
    
    // Provide specific error messages based on the error type
    if (err.message?.includes('Permission denied') || err.message?.includes('Missing or insufficient permissions')) {
      error.value = 'Permission denied. Please sign out and sign back in to refresh your authentication.'
    } else if (err.message?.includes('security rules')) {
      error.value = 'Security rules error. Please check Firebase Console for proper Firestore and Storage rules configuration.'
    } else if (err.message?.includes('Authentication')) {
      error.value = 'Authentication error. Please sign out and sign back in.'
    } else {
      error.value = err.message || 'Upload failed. Please check your connection and try again.'
    }
  } finally {
    uploading.value = false
  }
}
</script>