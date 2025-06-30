<template>
  <div v-if="photo" class="h-screen bg-black overflow-hidden flex flex-col">
    <!-- Header - Fixed height -->
    <header class="flex items-center justify-between p-4 px-4 bg-black flex-shrink-0">
      <button @click="$router.back()" class="text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <!-- Delete button - only show for photo owner -->
      <button 
        v-if="authStore.isAuthenticated && authStore.user && photo.userId === authStore.user.id"
        @click="showDeleteConfirm = true"
        class="text-white hover:text-gray-400 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
      <div v-else class="w-6"></div>
    </header>

    <!-- Main Content Container - Flex grow to fill remaining space -->
    <div class="flex-1 flex items-center justify-center px-4 min-h-0">
      <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl w-full">
        <!-- Unified Photo Container - Vertically Centered -->
        <div class="flex flex-col items-center space-y-4">
          <!-- User Info and Date Row - Above Image -->
          <div class="w-full flex items-center justify-between">
            <!-- User info - Clickable to navigate to user profile -->
            <router-link 
              :to="`/profile/${photo.userId}`"
              class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <!-- User avatar -->
              <div class="w-8 h-8 bg-gray-600 flex items-center justify-center">
                <span class="text-sm font-bold">{{ getUserInitials(authorName) }}</span>
              </div>
              <!-- User name -->
              <span class="text-white font-medium">{{ authorName }}</span>
            </router-link>
            <!-- Date -->
            <span class="text-gray-400 text-sm">{{ formatDate(photo.timestamp) }}</span>
          </div>

          <!-- Photo Container with Card Flip - Maintains vertical alignment -->
          <div class="w-full">
            <!-- Card Flip Container - 1:1 aspect ratio -->
            <div class="w-full aspect-square relative perspective-1000">
              <div 
                class="card-container w-full h-full relative transform-style-preserve-3d transition-transform duration-700 ease-in-out"
                :class="{ 'rotate-y-180': isFlipped }"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
              >
                <!-- Front Side - Image -->
                <div class="card-face card-front absolute inset-0 backface-hidden">
                  <img 
                    :src="photo.imageURL" 
                    :alt="photo.title || 'NCAD Archive Photo'"
                    class="w-full h-full object-cover cursor-pointer"
                    @dblclick="toggleLike"
                  />
                  
                  <!-- Temporary Badge - Only on front side -->
                  <div v-if="photo.temporary" class="absolute top-4 left-4 z-20">
                    <button 
                      @click="showGoneSoonModal = true"
                      class="bg-black border border-white px-3 py-1 hover:bg-ncad-dark-gray transition-colors"
                    >
                      <span class="text-xs font-medium text-white">GONE SOON</span>
                    </button>
                  </div>

                  <!-- Info Icon - Top right of image with square design -->
                  <div class="absolute top-4 right-4 z-20">
                    <button 
                      @click="showInfoModal = true"
                      class="w-8 h-8 bg-black flex items-center justify-center hover:bg-ncad-dark-gray transition-colors"
                    >
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </div>

                  <!-- Heart Animation Overlay -->
                  <div 
                    v-if="showHeartAnimation" 
                    class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                  >
                    <div class="animate-heart-pop">
                      <svg class="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Back Side - Title and Description -->
                <div class="card-face card-back absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8" style="background-color: #1F2022;">
                  <div class="text-center space-y-4">
                    <!-- Title -->
                    <h1 v-if="photo.title" class="text-2xl font-bold text-white mb-4">
                      {{ photo.title }}
                    </h1>
                    
                    <!-- Description -->
                    <p v-if="photo.description" class="text-white text-lg leading-relaxed">
                      {{ photo.description }}
                    </p>
                    <p v-else-if="!photo.title" class="text-gray-400 text-lg italic">
                      No description available
                    </p>
                  </div>
                </div>
              </div>

              <!-- Square Indicators - Positioned on the image -->
              <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                <div 
                  class="w-2 h-2 transition-colors duration-300"
                  :class="!isFlipped ? 'bg-white' : 'bg-gray-600'"
                ></div>
                <div 
                  class="w-2 h-2 transition-colors duration-300"
                  :class="isFlipped ? 'bg-white' : 'bg-gray-600'"
                ></div>
              </div>
            </div>

            <!-- Stats and Actions Row - Below Image, part of container -->
            <div class="w-full flex items-center justify-between mt-4">
              <!-- Left side - Stats with proper alignment -->
              <div class="flex items-center space-x-6">
                <!-- Visit count - center aligned content, left aligned container with right padding - Only show if location exists -->
                <div v-if="photo.location" class="flex items-center justify-center space-x-2 pr-4">
                  <svg class="w-7 h-7 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="currentColor"/>
                  </svg>
                  <span class="text-white text-lg font-medium">{{ photo.visits }}</span>
                </div>
                
                <!-- Likes count -->
                <button 
                  @click="toggleLike" 
                  :disabled="likingInProgress"
                  class="flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <svg class="w-6 h-6" :fill="isLiked ? '#52489C' : 'none'" :stroke="isLiked ? '#52489C' : 'white'" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span :class="isLiked ? 'text-[#52489C]' : 'text-white'" class="text-lg font-medium">{{ photo.likes || 0 }}</span>
                </button>
              </div>

              <!-- Right side - Actions -->
              <div class="flex items-center space-x-4">
                <!-- Share button -->
                <button @click="openShareModal" class="text-white hover:text-gray-400 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                  </svg>
                </button>
                
                <!-- Save button -->
                <button @click="toggleSave" class="transition-colors" :class="isSaved ? 'text-ncad-green' : 'text-white hover:text-gray-400'">
                  <svg class="w-6 h-6" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Take Me There CTA - Only show if there's location data -->
    <div v-if="photo.location" class="flex-shrink-0 p-4 pb-6">
      <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
        <button 
          @click="showLocationDrawer = true"
          class="w-full bg-black text-white py-3 flex items-center justify-center space-x-2 border border-gray-600 hover:bg-ncad-dark-gray transition-all"
        >
          <!-- Filled pin icon -->
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span class="font-medium">TAKE ME THERE</span>
        </button>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareModal 
      :is-visible="showShareModal"
      :share-data="shareData"
      @close="showShareModal = false"
      @shared="onPhotoShared"
    />

    <!-- Info Modal - Bottom Drawer Style matching other modals -->
    <div v-if="showInfoModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50" @click="showInfoModal = false">
      <div class="bg-black w-full max-w-md mx-auto p-4 space-y-4 transform transition-transform duration-300" 
           :class="{ 'translate-y-0': showInfoModal, 'translate-y-full': !showInfoModal }"
           @click.stop>
        
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-600 mx-auto mb-4"></div>
        
        <!-- Header -->
        <div class="text-center">
          <h3 class="text-lg font-semibold text-white">How to Use</h3>
          <p class="text-sm text-gray-400 mt-1">Photo interaction guide</p>
        </div>
        
        <!-- Instructions -->
        <div class="space-y-4">
          <div class="bg-black bg-opacity-80 p-4 border-l-4 border-ncad-green">
            <div class="flex items-start space-x-3">
                <p class="text-white text-sm font-medium">Swipe right on the image</p>
                <p class="text-gray-400 text-xs mt-1">to view title and description details</p>
              </div>
            </div>
          </div>
          
          <div class="bg-black bg-opacity-80 p-4 border-l-4 border-blue-500">
            <div class="flex items-start space-x-3">
                <p class="text-white text-sm font-medium">Double tap the image</p>
                <p class="text-gray-400 text-xs mt-1">to quickly like the photo</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Close Button -->
        <button 
          @click="showInfoModal = false"
          class="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-700 transition-all border border-white"
        >
          Got it!
        </button>
      </div>
    </div>

    <!-- Gone Soon Modal - Bottom Drawer Style -->
    <div v-if="showGoneSoonModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50" @click="showGoneSoonModal = false">
      <div class="bg-black w-full max-w-md mx-auto p-4 space-y-4 transform transition-transform duration-300" 
           :class="{ 'translate-y-0': showGoneSoonModal, 'translate-y-full': !showGoneSoonModal }"
           @click.stop>
        
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-600 mx-auto mb-4"></div>
        
        <!-- Header -->
        <div class="text-center">
          <h3 class="text-lg font-semibold text-white">Gone Soon</h3>
          <p class="text-sm text-gray-400 mt-1">Temporary Content Information</p>
        </div>
        
        <!-- Content -->
        <div class="space-y-4">
          <div class="bg-black bg-opacity-80 p-4 border-l-4 border-ncad-green">
            <p class="text-white text-sm">
              This photo features something <strong>temporary</strong> that may not be there when you visit the location.
            </p>
          </div>
          
          <div class="bg-black p-4 border-l-4 border-yellow-500">
            <p class="text-white text-sm">
              <strong class="text-yellow-400">Examples:</strong> Student artwork, temporary installations, exhibitions, events, or objects that are regularly moved or changed.
            </p>
          </div>
        </div>
        
        <!-- Close Button -->
        <button 
          @click="showGoneSoonModal = false"
          class="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-700 transition-all border border-white"
        >
          Got it!
        </button>
      </div>
    </div>

    <!-- Location Warning Bottom Drawer -->
    <div v-if="showLocationDrawer" class="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50" @click="showLocationDrawer = false">
      <div class="bg-black w-full max-w-md mx-auto p-4 space-y-4" @click.stop>
        <div class="w-12 h-1 bg-gray-600 mx-auto mb-4"></div>
        
        <h3 class="text-lg font-semibold text-white text-center">Location Information</h3>
        
        <div class="space-y-4">
          <!-- Always show floor information -->
          <div class="bg-black bg-opacity-80 p-4 border-l-4 border-ncad-green">
            <p class="text-white text-sm">
              The Photo might be clicked on the 1st, 2nd, 3rd floor or the basement of the Campus, checking that might help!
            </p>
          </div>
          
          <!-- Show temporary spot warning only for temporary photos -->
          <div v-if="photo.temporary" class="bg-ncad-dark-gray p-4 border-l-4 border-yellow-500">
            <p class="text-white text-sm">
              The object might be removed from here as it comes under temporary spot.
            </p>
          </div>
        </div>
        
        <div class="flex space-x-3 pt-4">
          <button 
            @click="showLocationDrawer = false"
            class="flex-1 bg-black text-white py-3 font-medium hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="openInGoogleMaps"
            class="flex-1 bg-black text-white py-3 font-medium hover:bg-ncad-dark-gray transition-colors border border-white"
          >
            TAKE ME THERE
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-ncad-dark-gray p-4 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4 text-white">Delete Photo</h3>
        <p class="text-gray-400 mb-6">Are you sure you want to delete this photo? This action cannot be undone.</p>
        
        <div v-if="deleteError" class="bg-red-900 bg-opacity-20 border border-red-500 p-3 mb-4">
          <p class="text-red-400 text-sm">{{ deleteError }}</p>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="confirmDelete"
            :disabled="deleting"
            class="flex-1 bg-red-600 text-white py-2 font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
          <button 
            @click="showDeleteConfirm = false; deleteError = ''"
            :disabled="deleting"
            class="flex-1 bg-gray-600 text-white py-2 font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else-if="loading" class="min-h-screen bg-black flex items-center justify-center">
    <p class="text-gray-400">Loading photo...</p>
  </div>
  
  <div v-else class="min-h-screen bg-black flex items-center justify-center">
    <p class="text-gray-400">Photo not found</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import ShareModal from '../components/ShareModal.vue'
import type { ShareData } from '../utils/shareUtils'

const route = useRoute()
const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()

const photo = ref(null)
const loading = ref(true)
const authorName = ref('')
const isSaved = ref(false)
const isLiked = ref(false)
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const deleteError = ref('')
const showLocationDrawer = ref(false)
const showShareModal = ref(false)
const showGoneSoonModal = ref(false)
const showInfoModal = ref(false) // New modal state for instructions

// New reactive variables for like improvements
const likingInProgress = ref(false)
const showHeartAnimation = ref(false)

// Card flip state
const isFlipped = ref(false)

// Touch handling for swipe detection
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)

// Computed share data
const shareData = computed((): ShareData | null => {
  if (!photo.value) return null
  
  return {
    title: photo.value.title || 'NCAD Archive Photo',
    description: photo.value.description || `A photo by ${authorName.value} from NCAD Archive`,
    imageUrl: photo.value.imageURL,
    pageUrl: window.location.href
  }
})

onMounted(async () => {
  const id = route.params.id as string
  
  try {
    photo.value = await galleryStore.getPhotoById(id)
    
    if (photo.value) {
      // Load author name
      authorName.value = await galleryStore.getUserName(photo.value.userId)
      
      // Check if photo is saved and liked (only for authenticated users)
      if (authStore.isAuthenticated) {
        isSaved.value = await galleryStore.isPhotoSaved(photo.value.id)
        isLiked.value = await galleryStore.isPhotoLiked(photo.value.id)
      }
    }
  } catch (error) {
    console.error('Error loading photo:', error)
  } finally {
    loading.value = false
  }
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}

const getUserInitials = (name: string) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const openShareModal = () => {
  showShareModal.value = true
}

const onPhotoShared = (success: boolean) => {
  if (success) {
    console.log('Photo shared successfully')
  }
}

const toggleSave = async () => {
  if (!authStore.isAuthenticated || !photo.value) {
    router.push('/signup')
    return
  }
  
  try {
    if (isSaved.value) {
      await galleryStore.unsavePhoto(photo.value.id)
      isSaved.value = false
    } else {
      await galleryStore.savePhoto(photo.value.id)
      isSaved.value = true
    }
  } catch (error) {
    console.error('Error toggling save:', error)
  }
}

const toggleLike = async () => {
  if (!authStore.isAuthenticated || !photo.value) {
    router.push('/signup')
    return
  }
  
  // Prevent multiple simultaneous like operations
  if (likingInProgress.value) {
    return
  }
  
  likingInProgress.value = true
  
  try {
    const newLikedState = await galleryStore.toggleLike(photo.value.id)
    isLiked.value = newLikedState
    
    // Show heart animation only when liking (not unliking)
    if (newLikedState) {
      showHeartAnimation.value = true
      
      // Hide heart animation after 1 second
      setTimeout(() => {
        showHeartAnimation.value = false
      }, 1000)
    }
  } catch (error) {
    console.error('Error toggling like:', error)
  } finally {
    // Add a small delay to prevent rapid successive clicks
    setTimeout(() => {
      likingInProgress.value = false
    }, 300)
  }
}

const confirmDelete = async () => {
  if (!photo.value) return
  
  deleting.value = true
  deleteError.value = ''
  
  try {
    const result = await galleryStore.deletePhoto(photo.value.id)
    
    if (result.success) {
      // Decrement user upload count
      if (authStore.user) {
        await authStore.decrementUploadCount()
      }
      
      // Navigate back to home page instead of profile to see updated gallery
      router.push('/')
    } else {
      deleteError.value = result.error || 'Failed to delete photo'
    }
  } catch (error) {
    console.error('Error deleting photo:', error)
    deleteError.value = 'An unexpected error occurred'
  } finally {
    deleting.value = false
  }
}

const openInGoogleMaps = async () => {
  if (!photo.value || !photo.value.location) return
  
  // Close the drawer
  showLocationDrawer.value = false
  
  // Increment visits when user clicks "Take me there"
  try {
    await galleryStore.incrementVisits(photo.value.id)
  } catch (error) {
    console.error('Error incrementing visits:', error)
  }
  
  // Create Google Maps URL with coordinates
  const { lat, lng } = photo.value.location
  
  // Try to open Google Maps app first, fallback to web if app not available
  const googleMapsAppUrl = `comgooglemaps://?q=${lat},${lng}&zoom=18`
  const googleMapsWebUrl = `https://www.google.com/maps?q=${lat},${lng}&z=18`
  
  // Check if we're on mobile and try to open the app
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    // Try to open the Google Maps app
    const link = document.createElement('a')
    link.href = googleMapsAppUrl
    link.click()
    
    // Fallback to web version after a short delay if app doesn't open
    setTimeout(() => {
      window.open(googleMapsWebUrl, '_blank')
    }, 3000)
  } else {
    // On desktop, just open the web version
    window.open(googleMapsWebUrl, '_blank')
  }
}

// Touch event handlers for swipe detection
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  // Prevent default to avoid scrolling while swiping
  e.preventDefault()
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].clientX
  touchEndY.value = e.changedTouches[0].clientY
  
  const deltaX = touchEndX.value - touchStartX.value
  const deltaY = touchEndY.value - touchStartY.value
  
  // Check if it's a horizontal swipe (more horizontal than vertical movement)
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    // Left swipe - flip to back (description)
    if (deltaX < 0 && !isFlipped.value) {
      isFlipped.value = true
    }
    // Right swipe - flip to front (image)
    else if (deltaX > 0 && isFlipped.value) {
      isFlipped.value = false
    }
  }
}
</script>

<style scoped>
/* 3D perspective and transform styles */
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.card-face {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

/* Ensure smooth transitions */
.card-container {
  transition: transform 0.7s ease-in-out;
}

/* Prevent text selection during swipe */
.card-container {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Ensure no overflow on mobile */
@media (max-width: 768px) {
  .h-screen {
    height: 100vh;
    height: 100dvh; /* Use dynamic viewport height on mobile */
  }
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .max-w-md {
    max-width: 28rem;
  }
}

@media (min-width: 1024px) {
  .lg\:max-w-lg {
    max-width: 32rem;
  }
}

@media (min-width: 1280px) {
  .xl\:max-w-xl {
    max-width: 36rem;
  }
}
</style>