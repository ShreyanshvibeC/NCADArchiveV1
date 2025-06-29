<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 mobile-safe-area">
    <!-- Enhanced Header -->
    <header class="flex items-center justify-between py-6">
      <button @click="$router.back()" class="p-3 text-white hover:text-purple-400 transition-all duration-300 glass-card-mobile mobile-touch-feedback" style="border-radius: 12px;">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none drop-shadow-lg">Upload Photo</h1>

      <div class="w-12"></div>
    </header>

    <!-- Main Content Container -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-8">
      <!-- Authentication Check -->
      <div v-if="!authStore.isAuthenticated" class="text-center py-12">
        <div class="premium-card">
          <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <p class="text-gray-400 mb-6">Please sign in to upload photos</p>
          <div class="space-y-4">
            <router-link 
              to="/login" 
              class="btn-premium w-full text-center mobile-touch-feedback block"
            >
              Sign In
            </router-link>
            <router-link 
              to="/signup" 
              class="block w-full glass-card-mobile text-white text-center py-3 px-4 font-medium hover:bg-white/10 transition-all border border-white/20 mobile-touch-feedback"
              style="border-radius: 12px;"
            >
              Create Account
            </router-link>
          </div>
        </div>
      </div>

      <!-- Upload Limit Check -->
      <div v-else-if="authStore.user && authStore.user.uploadCount >= 25" class="text-center py-12">
        <div class="premium-card">
          <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="glass-card-mobile p-4 mb-6 border-l-4 border-yellow-500">
            <p class="text-yellow-400">
              You've reached the upload limit of 25 photos. Delete some photos to upload new ones.
            </p>
          </div>
          <router-link 
            to="/profile" 
            class="btn-premium mobile-touch-feedback"
          >
            Manage Photos
          </router-link>
        </div>
      </div>

      <!-- Enhanced Upload Interface -->
      <div v-else>
        <!-- Revolutionary Upload Area -->
        <div v-if="!selectedImage" class="premium-card border-2 border-dashed border-purple-500/30 p-12 text-center mb-8 hover:border-purple-500/50 transition-all duration-300">
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            capture="environment"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <div class="space-y-6">
            <div class="relative">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div class="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 blur-lg"></div>
            </div>
            
            <div>
              <button 
                @click="fileInput?.click()"
                class="btn-premium mobile-touch-feedback"
              >
                Take Photo
              </button>
              <p class="text-gray-400 text-sm mt-3">or select from device</p>
            </div>
          </div>
        </div>

        <!-- Enhanced Preview and Form -->
        <div v-if="selectedImage" class="space-y-8">
          <!-- Premium Image Preview -->
          <div class="relative image-container">
            <img :src="previewUrl" alt="Preview" class="w-full aspect-square object-cover" />
            <button 
              @click="clearSelection"
              class="absolute top-4 right-4 glass-card-mobile p-3 hover:bg-white/20 transition-all duration-300 mobile-touch-feedback"
              style="border-radius: 12px;"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Enhanced Form -->
          <form @submit.prevent="uploadPhoto" class="space-y-8">
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-300">
                Title (required) - Max 25 words
              </label>
              <input 
                v-model="title"
                type="text" 
                required
                class="mobile-input"
                :class="{ 'border-red-500': titleError }"
                placeholder="Enter a title for your photo"
              />
              
              <div class="flex justify-between items-center">
                <div class="text-xs" :class="titleError ? 'text-red-400' : 'text-gray-400'">
                  {{ titleWordCount }}/25 words
                </div>
                <div v-if="titleError" class="text-red-400 text-xs">
                  Word limit exceeded
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-300">
                Description (optional) - Max 250 words
              </label>
              <textarea 
                v-model="description"
                rows="4"
                class="mobile-input resize-none"
                :class="{ 'border-red-500': descriptionError }"
                placeholder="Describe your photo (max 250 words)"
              ></textarea>
              
              <div class="flex justify-between items-center">
                <div class="text-xs" :class="descriptionError ? 'text-red-400' : 'text-gray-400'">
                  {{ descriptionWordCount }}/250 words
                </div>
                <div v-if="descriptionError" class="text-red-400 text-xs">
                  Word limit exceeded
                </div>
              </div>
            </div>

            <!-- Enhanced Checkboxes -->
            <div class="space-y-4">
              <div class="glass-card-mobile p-4 flex items-center space-x-4">
                <input 
                  id="location-checkbox"
                  v-model="includeLocation"
                  type="checkbox"
                  class="w-5 h-5 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label for="location-checkbox" class="text-sm font-medium text-white cursor-pointer flex-1">
                  Include location information
                </label>
              </div>

              <div class="glass-card-mobile p-4 flex items-center space-x-4">
                <input 
                  id="temporary-checkbox"
                  v-model="isTemporary"
                  type="checkbox"
                  class="w-5 h-5 bg-transparent border-2 border-purple-500 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label for="temporary-checkbox" class="text-sm font-medium text-white cursor-pointer flex-1">
                  Check this if the object or artwork in the photo is temporary and may not be there later
                </label>
              </div>
            </div>

            <!-- Enhanced Success Message -->
            <div v-if="success" class="glass-card-mobile p-4 border-l-4 border-green-500">
              <p class="text-green-400 text-sm">{{ success }}</p>
            </div>

            <!-- Enhanced Error Message -->
            <div v-if="error" class="glass-card-mobile p-4 border-l-4 border-red-500">
              <p class="text-red-400 text-sm">{{ error }}</p>
              <div v-if="showTroubleshooting" class="mt-4 text-xs text-red-400">
                <p class="font-medium mb-3">Troubleshooting steps:</p>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Sign out and sign back in to refresh your authentication</li>
                  <li>Check that localhost is in Firebase Console > Authentication > Settings > Authorized domains</li>
                  <li>Verify Firestore Database security rules allow photo creation</li>
                  <li>Verify Storage security rules allow image uploads</li>
                  <li>Clear browser cache and cookies if the problem persists</li>
                </ol>
                <button 
                  @click="handleSignOut"
                  class="mt-4 glass-card-mobile text-red-400 px-4 py-2 text-xs hover:bg-red-500/20 transition-all mobile-touch-feedback"
                  style="border-radius: 8px;"
                >
                  Sign Out & Try Again
                </button>
              </div>
            </div>

            <button 
              type="submit"
              :disabled="uploading || !selectedImage || !authStore.isAuthenticated || descriptionError || titleError || !title.trim()"
              class="btn-premium w-full mobile-touch-feedback"
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
const includeLocation = ref(false)
const uploading = ref(false)
const error = ref('')
const success = ref('')

const countWords = (text: string): number => {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

const titleWordCount = computed(() => countWords(title.value))
const descriptionWordCount = computed(() => countWords(description.value))

const titleError = computed(() => {
  return titleWordCount.value > 25
})

const descriptionError = computed(() => {
  return descriptionWordCount.value > 250
})

const canUpload = computed(() => {
  return selectedImage.value && 
         authStore.isAuthenticated && 
         authStore.user && 
         !uploading.value && 
         !descriptionError.value && 
         !titleError.value && 
         title.value.trim()
})

const showTroubleshooting = computed(() => {
  return error.value && (
    error.value.includes('Permission denied') || 
    error.value.includes('security rules') || 
    error.value.includes('Authentication') ||
    error.value.includes('unauthorized')
  )
})

watch(title, (newValue) => {
  const words = newValue.trim().split(/\s+/)
  if (words.length > 25 && newValue.trim() !== '') {
    title.value = words.slice(0, 25).join(' ')
  }
})

watch(description, (newValue) => {
  const words = newValue.trim().split(/\s+/)
  if (words.length > 250 && newValue.trim() !== '') {
    description.value = words.slice(0, 250).join(' ')
  }
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    error.value = ''
    
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select a valid image file'
      return
    }
    
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
  includeLocation.value = false
  error.value = ''
  success.value = ''
  
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
  if (!authStore.isAuthenticated) {
    error.value = 'You must be signed in to upload photos'
    return
  }
  
  if (!authStore.user) {
    error.value = 'User profile not loaded. Please try signing in again.'
    return
  }
  
  const auth = getAuth()
  if (!auth.currentUser) {
    error.value = 'Authentication expired. Please sign out and sign back in.'
    return
  }
  
  if (auth.currentUser.uid !== authStore.user.id) {
    error.value = 'Authentication mismatch. Please sign out and sign back in.'
    return
  }
  
  if (!selectedImage.value) {
    error.value = 'Please select an image to upload'
    return
  }
  
  if (!title.value.trim()) {
    error.value = 'Title is required'
    return
  }
  
  if (titleWordCount.value > 25) {
    error.value = 'Title must be 25 words or less'
    return
  }
  
  if (descriptionWordCount.value > 250) {
    error.value = 'Description must be 250 words or less'
    return
  }
  
  uploading.value = true
  error.value = ''
  success.value = ''
  
  try {
    console.log('Starting upload process...')
    
    await authStore.refreshAuthToken()
    
    console.log('Compressing image to 1:1 aspect ratio...')
    const compressedFile = await compressImage(selectedImage.value)
    console.log('Image compressed successfully. Original size:', selectedImage.value.size, 'Compressed size:', compressedFile.size)
    
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
    
    const photoData: any = {
      title: title.value.trim(),
      temporary: isTemporary.value,
      userId: auth.currentUser.uid
    }
    
    const trimmedDescription = description.value.trim()
    if (trimmedDescription) {
      photoData.description = trimmedDescription
    }
    
    if (includeLocation.value && location) {
      photoData.location = location
    }
    
    console.log('Uploading photo with data:', photoData)
    
    const result = await galleryStore.addPhoto(photoData, compressedFile)
    
    if (result.success) {
      console.log('Photo uploaded successfully, ID:', result.photoId)
      success.value = 'Photo uploaded successfully! Redirecting...'
      
      await authStore.incrementUploadCount()
      console.log('Upload count incremented')
      
      clearSelection()
      
      setTimeout(() => {
        console.log('Redirecting to home page...')
        router.push('/')
      }, 1000)
    } else {
      console.error('Upload failed:', result.error)
      error.value = result.error || 'Upload failed. Please try again.'
    }
  } catch (err: any) {
    console.error('Upload error:', err)
    
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