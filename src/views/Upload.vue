<template>
  <div class="min-h-screen bg-black p-4">
    <!-- Header -->
    <header class="flex items-center justify-between bg-black py-4 px-4">
      <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none">Upload Photo</h1>

      <div class="w-6"></div>
    </header>

    <!-- Upload Success Toast -->
    <UploadToast 
      :is-visible="showUploadToast"
      @hide="showUploadToast = false"
    />

    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-8">
      <!-- Authentication Check -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-12">
        <p class="text-gray-400 mb-4">Please sign in to upload photos</p>
        <div class="space-y-3">
          <router-link 
            to="/login" 
            class="block bg-ncad-green text-white px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
          >
            Sign In
          </router-link>
          <router-link 
            to="/signup" 
            class="block bg-black text-white px-6 py-3 font-medium hover:bg-ncad-dark-gray transition-all border border-gray-600"
          >
            Create Account
          </router-link>
        </div>
      </div>

      <!-- Upload Limit Check -->
      <div v-else-if="authStore.user && authStore.user.uploadCount >= 25" class="text-center py-12">
        <div class="bg-ncad-green bg-opacity-20 border border-ncad-green p-4 mb-4">
          <p class="text-ncad-green">
            You've reached the upload limit of 25 photos. Delete some photos to upload new ones.
          </p>
        </div>
        <router-link 
          to="/profile" 
          class="bg-ncad-green text-white px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
        >
          Manage Photos
        </router-link>
      </div>

      <!-- Upload Interface -->
      <div v-else>
        <!-- Upload Area -->
        <div v-if="!selectedImage" class="border-2 border-dashed border-gray-600 p-12 text-center mb-8">
          <!-- Hidden file inputs for different purposes -->
          <input 
            ref="cameraInput"
            type="file" 
            accept="image/*" 
            capture="environment"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <input 
            ref="deviceInput"
            type="file" 
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <div class="space-y-6">
            <!-- Camera SVG Icon -->
            <svg class="w-16 h-16 mx-auto text-gray-600" viewBox="0 0 98 98" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M60.1555 16.333C60.4917 16.3332 60.8227 16.4164 61.119 16.5752C61.4154 16.7341 61.6679 16.9637 61.8542 17.2436L69.4165 28.583H85.7498C86.8328 28.583 87.8714 29.0132 88.6372 29.779C89.403 30.5448 89.8332 31.5834 89.8332 32.6663V77.583C89.8332 78.666 89.403 79.7046 88.6372 80.4704C87.8714 81.2361 86.8328 81.6663 85.7498 81.6663H12.2498C11.1669 81.6663 10.1283 81.2361 9.36248 80.4704C8.59671 79.7046 8.1665 78.666 8.1665 77.583V32.6663C8.1665 31.5834 8.59671 30.5448 9.36248 29.779C10.1283 29.0132 11.1669 28.583 12.2498 28.583H28.5832L36.1455 17.2436C36.3318 16.9637 36.5843 16.7341 36.8806 16.5752C37.177 16.4164 37.5079 16.3332 37.8442 16.333H60.1555ZM48.9998 67.3747C52.7902 67.3747 56.4254 65.869 59.1056 63.1887C61.7858 60.5085 63.2915 56.8734 63.2915 53.083C63.2915 49.2926 61.7858 45.6575 59.1056 42.9773C56.4254 40.2971 52.7902 38.7913 48.9998 38.7913C45.2094 38.7913 41.5743 40.2971 38.8941 42.9773C36.2139 45.6575 34.7082 49.2926 34.7082 53.083C34.7082 56.8734 36.2139 60.5085 38.8941 63.1887C41.5743 65.869 45.2094 67.3747 48.9998 67.3747Z"/>
            </svg>
            
            <div class="space-y-4">
              <!-- Primary CTA - Take Photo -->
              <button 
                @click="cameraInput?.click()"
                class="w-full bg-ncad-green text-white px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
              >
                Take Photo
              </button>
              
              <!-- Secondary CTA - Select from Device -->
              <button 
                @click="deviceInput?.click()"
                class="w-full bg-black text-white px-6 py-3 font-medium hover:bg-ncad-dark-gray transition-all border border-gray-600"
              >
                Select from Device
              </button>
              
              <p class="text-gray-400 text-sm">{{ mobileUploadMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Preview and Form -->
        <div v-if="selectedImage" class="space-y-6">
          <!-- Image Preview - 1:1 aspect ratio -->
          <div class="relative">
            <img :src="previewUrl" alt="Preview" class="w-full aspect-square object-cover mobile-optimized-image" />
            <button 
              @click="clearSelection"
              class="absolute top-4 right-4 bg-ncad-dark-gray bg-opacity-75 p-2 hover:bg-opacity-100 transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="uploadPhoto" class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-2">
                Add Title*
              </label>
              <input  
                v-model="title"
                type="text" 
                required
                maxlength="25"
                class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none transition-colors"
                :class="{ 'border-red-500': titleError }"
                placeholder="Enter a title for your photo"
              />
              
              <!-- Character count and error message for title -->
              <div class="flex justify-between items-center mt-2">
                <div class="text-xs" :class="titleError ? 'text-red-400' : 'text-gray-400'">
                  {{ titleCharCount }}/25 characters
                </div>
                <div v-if="titleError" class="text-red-400 text-xs">
                  Character limit exceeded
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">
                Add Description
              </label>
              <textarea 
                v-model="description"
                rows="4"
                maxlength="250"
                class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none resize-none transition-colors"
                :class="{ 'border-red-500': descriptionError }"
                placeholder="Describe your photo"
              ></textarea>
              
              <!-- Character count and error message for description -->
              <div class="flex justify-between items-center mt-2">
                <div class="text-xs" :class="descriptionError ? 'text-red-400' : 'text-gray-400'">
                  {{ descriptionCharCount }}/250 characters
                </div>
                <div v-if="descriptionError" class="text-red-400 text-xs">
                  Character limit exceeded
                </div>
              </div>
            </div>

            <!-- Include Location Checkbox - Default checked -->
            <div class="flex items-start space-x-3">
              <div class="relative flex-shrink-0 mt-0.5">
                <input 
                  id="location-checkbox"
                  v-model="includeLocation"
                  type="checkbox"
                  class="sr-only"
                />
                <label 
                  for="location-checkbox" 
                  class="cursor-pointer"
                >
                  <div 
                    class="w-5 h-5 border-2 border-gray-600 bg-black flex items-center justify-center transition-all"
                    :class="{ 'bg-ncad-green border-ncad-green': includeLocation }"
                  >
                    <svg 
                      v-if="includeLocation"
                      class="w-3.5 h-3.5 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      stroke="currentColor"
                      stroke-width="1"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </label>
              </div>
              <label for="location-checkbox" class="text-sm font-medium text-white cursor-pointer leading-relaxed">
                Include location information
              </label>
            </div>

            <!-- Temporary Photo Checkbox -->
            <div class="flex items-start space-x-3">
              <div class="relative flex-shrink-0 mt-0.5">
                <input 
                  id="temporary-checkbox"
                  v-model="isTemporary"
                  type="checkbox"
                  class="sr-only"
                />
                <label 
                  for="temporary-checkbox" 
                  class="cursor-pointer"
                >
                  <div 
                    class="w-5 h-5 border-2 border-gray-600 bg-black flex items-center justify-center transition-all"
                    :class="{ 'bg-ncad-green border-ncad-green': isTemporary }"
                  >
                    <svg 
                      v-if="isTemporary"
                      class="w-3.5 h-3.5 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      stroke="currentColor"
                      stroke-width="1"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </label>
              </div>
              <label for="temporary-checkbox" class="text-sm font-medium text-white cursor-pointer leading-relaxed">
                Check this if the object or artwork in the photo is temporary and may not be there later
              </label>
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
              :disabled="uploading || !selectedImage || !authStore.isAuthenticated || descriptionError || titleError || !title.trim()"
              class="w-full bg-ncad-green text-white py-3 font-medium hover:bg-opacity-80 transition-all disabled:opacity-50"
            >
              {{ uploading ? uploadingMessage : 'Upload Photo' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { compressImage, getCurrentLocation } from '../utils/imageUtils'
import { isMobileDevice, isMobileDataSaver } from '../utils/mobileUtils'
import { MobilePerformanceTracker } from '../utils/mobilePerformance'
import { getAuth } from 'firebase/auth'
import UploadToast from '../components/UploadToast.vue'

const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()

const cameraInput = ref<HTMLInputElement>()
const deviceInput = ref<HTMLInputElement>()
const selectedImage = ref<File | null>(null)
const previewUrl = ref('')
const title = ref('')
const description = ref('')
const isTemporary = ref(false)
const includeLocation = ref(true) // Default to true (enabled by default)
const uploading = ref(false)
const error = ref('')
const showUploadToast = ref(false)

// Mobile-specific messages
const mobileUploadMessage = ref('Choose an option to get started')
const uploadingMessage = ref('Uploading...')

// Character counting functions
const countCharacters = (text: string): number => {
  return text.length
}

// Computed properties for character counts
const titleCharCount = computed(() => countCharacters(title.value))
const descriptionCharCount = computed(() => countCharacters(description.value))

// Check if title exceeds character limit
const titleError = computed(() => {
  return titleCharCount.value > 25
})

// Check if description exceeds character limit
const descriptionError = computed(() => {
  return descriptionCharCount.value > 250
})

// Computed property to check if upload is ready
const canUpload = computed(() => {
  return selectedImage.value && 
         authStore.isAuthenticated && 
         authStore.user && 
         !uploading.value && 
         !descriptionError.value && 
         !titleError.value && 
         title.value.trim()
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

// Update mobile messages based on device and connection
const updateMobileMessages = () => {
  if (isMobileDevice()) {
    if (isMobileDataSaver()) {
      mobileUploadMessage.value = 'Optimized for your connection'
      uploadingMessage.value = 'Optimizing and uploading...'
    } else {
      mobileUploadMessage.value = 'Mobile optimized upload'
      uploadingMessage.value = 'Uploading...'
    }
  } else {
    mobileUploadMessage.value = 'Choose an option to get started'
    uploadingMessage.value = 'Uploading...'
  }
}

// Watch title for character limit validation
watch(title, (newValue) => {
  if (newValue.length > 25) {
    // Automatically trim to 25 characters
    title.value = newValue.substring(0, 25)
  }
})

// Watch description for character limit validation
watch(description, (newValue) => {
  if (newValue.length > 250) {
    // Automatically trim to 250 characters
    description.value = newValue.substring(0, 250)
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
    
    // Mobile-specific file size validation (smaller limit on mobile)
    const maxSize = isMobileDevice() ? 8 * 1024 * 1024 : 10 * 1024 * 1024 // 8MB on mobile, 10MB on desktop
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / 1024 / 1024)
      error.value = `Image file is too large. Please select an image smaller than ${sizeMB}MB`
      return
    }
    
    selectedImage.value = file
    previewUrl.value = URL.createObjectURL(file)
    console.log('Image selected successfully:', file.name, 'Size:', file.size)
    
    // Track mobile performance
    if (isMobileDevice()) {
      MobilePerformanceTracker.trackImageLoad(previewUrl.value)
    }
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
  includeLocation.value = true // Reset to default (enabled)
  error.value = ''

  // Reset both file inputs
  if (cameraInput.value) {
    cameraInput.value.value = ''
  }
  if (deviceInput.value) {
    deviceInput.value.value = ''
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
  
  // Check title is required
  if (!title.value.trim()) {
    error.value = 'Title is required'
    return
  }
  
  // Check title character limit
  if (titleCharCount.value > 25) {
    error.value = 'Title must be 25 characters or less'
    return
  }
  
  // Check description character limit
  if (descriptionCharCount.value > 250) {
    error.value = 'Description must be 250 characters or less'
    return
  }
  
  uploading.value = true
  error.value = ''
  
  try {
    console.log('Starting upload process...')
    console.log('User authenticated:', authStore.isAuthenticated)
    console.log('User ID:', authStore.user.id)
    console.log('Firebase Auth UID:', auth.currentUser.uid)
    console.log('User email:', authStore.user.email)
    console.log('Image:', selectedImage.value.name)
    console.log('Is temporary:', isTemporary.value)
    console.log('Include location:', includeLocation.value)
    console.log('Mobile device:', isMobileDevice())
    console.log('Mobile data saver:', isMobileDataSaver())
    
    // Refresh auth token before upload
    console.log('Refreshing authentication token...')
    await authStore.refreshAuthToken()
    
    // Compress image with mobile-optimized settings
    console.log('Compressing image with mobile optimization...')
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
      title: title.value.trim(), // Title is now required
      temporary: isTemporary.value,
      userId: auth.currentUser.uid
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
      
      // Show success toast
      showUploadToast.value = true
      
      // Increment user upload count
      await authStore.incrementUploadCount()
      console.log('Upload count incremented')
      
      // Clear form
      clearSelection()
      
      // Set flag for reveal animation on homepage
      sessionStorage.setItem('ncad-archive-from-upload', 'true')
      
      // Redirect to home page immediately after showing toast
      setTimeout(() => {
        console.log('Redirecting to home page...')
        router.push('/')
      }, 800) // Shorter delay - redirect while toast is still visible
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

onMounted(() => {
  updateMobileMessages()
})
</script>

<style scoped>
/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .mobile-optimized-image {
    will-change: transform;
    backface-visibility: hidden;
  }
}
</style>