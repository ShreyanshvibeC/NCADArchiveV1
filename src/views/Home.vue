<template>
  <div>
    <!-- Marquee Banner at the very top -->
    <MarqueeBanner />

    <!-- Fixed Header with Logo on Left and Hamburger on Right - positioned below marquee -->
    <header class="fixed top-[40px] left-0 right-0 z-30 flex items-center justify-between p-4 border-b border-gray-600 bg-black">
      <div class="flex items-center">
        <img 
          src="/logo -gif.gif" 
          alt="NCAD Logo" 
          class="h-8 mr-4" 
          @error="handleImageError"
        />
        <svg class="h-6" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="15" fill="white" font-family="Spenser" font-size="18" font-weight="900">ARCHIVE</text>
        </svg>
      </div>
      
      <!-- Hamburger Button - Vertically centered in header -->
      <button 
        @click="hamburgerMenu?.toggleMenu()"
        class="w-12 h-12 bg-black border border-gray-600 flex items-center justify-center hover:bg-gray-900 transition-colors"
      >
        <div class="w-6 h-6 flex flex-col justify-center space-y-1">
          <div 
            class="w-full h-0.5 bg-white transition-all duration-300"
            :class="{ 'rotate-45 translate-y-1.5': hamburgerMenu?.isOpen }"
          ></div>
          <div 
            class="w-full h-0.5 bg-white transition-all duration-300"
            :class="{ 'opacity-0': hamburgerMenu?.isOpen }"
          ></div>
          <div 
            class="w-full h-0.5 bg-white transition-all duration-300"
            :class="{ '-rotate-45 -translate-y-1.5': hamburgerMenu?.isOpen }"
          ></div>
        </div>
      </button>
    </header>

    <!-- Hamburger Menu Component -->
    <HamburgerMenu ref="hamburgerMenu" />

    <!-- Photos Loading Screen - Primary loader with original design -->
    <div v-if="showPhotosLoading" class="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div class="text-center space-y-4">
        <!-- Simple loading text with blinking cursor - matching original -->
        <h2 class="text-xl font-semibold text-white">
          {{ loadingProgress }}<span class="text-ncad-green animate-blink">|</span>
        </h2>
        <p class="text-gray-400 text-sm">Preparing your creative journey...</p>
      </div>
    </div>

    <!-- Main Content Container with Desktop Margins and top padding for marquee + fixed header -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-[100px]">
      <!-- Hero Section -->
      <section class="px-4 py-24">
        <!-- Fixed height container for hero text to prevent vertical shift -->
        <div class="h-[240px] flex flex-col justify-start">
          <h1 id="hero-typewriter" class="text-5xl font-bold leading-none mb-6 min-h-[192px]"></h1>
        </div>
        
        <!-- Hero Paragraph -->
        <div class="space-y-8">
          <p class="text-gray-400 font-medium text-lg leading-relaxed">
            Follow the unseen threads<br>
            of creativity across campus.
          </p>
        </div>
      </section>

      <!-- Image Feed -->
      <div class="pb-24">
        <div v-if="galleryStore.photos.length === 0 && !galleryStore.loading && !showPhotosLoading" class="text-center py-12 text-gray-400">
          <p>No photos uploaded yet</p>
          <button 
            @click="handleUploadClick"
            class="inline-block mt-4 bg-ncad-green text-white px-6 py-2 font-medium hover:bg-opacity-80 transition-all"
          >
            Upload the first photo
          </button>
        </div>

        <div 
          v-for="photo in galleryStore.photos" 
          :key="photo.id"
          class="mb-10 cursor-pointer"
          @click="navigateToPhoto(photo.id)"
        >
          <!-- Title (if exists) - Left aligned -->
          <div v-if="photo.title" class="px-4 mb-2">
            <h2 class="text-2xl font-medium text-white text-left">{{ photo.title }}</h2>
          </div>

          <!-- Image Container - 1:1 aspect ratio with lazy loading -->
          <div class="relative w-full aspect-square overflow-hidden">
            <img 
              :src="photo.imageURL" 
              :alt="photo.title || 'NCAD Archive Photo'"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="handleImageError"
            />
            
            <!-- Temporary Badge - Clickable -->
            <div v-if="photo.temporary" class="absolute top-4 left-4 z-20">
              <button 
                @click.stop="showGoneSoonModal = true; selectedPhoto = photo"
                class="bg-black border border-white px-3 py-1 hover:bg-gray-800 transition-colors"
              >
                <span class="text-xs font-medium text-white">GONE SOON</span>
              </button>
            </div>

            <!-- Visit Count with Gradient - Only show if location exists -->
            <div v-if="photo.location" class="absolute bottom-0 right-0 w-20 h-20 z-10">
              <!-- Diagonal gradient background -->
              <div class="absolute inset-0" style="background: linear-gradient(135deg, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.8) 100%);"></div>

              <!-- Icon and Count Container, Centered and Right-Aligned -->
              <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center text-white z-20">
                <svg class="w-6 h-6 mb-1" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="currentColor"/>
                </svg>
                <span class="text-sm font-medium">{{ photo.visits || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Info - Likes left, Author right -->
          <div class="px-4 mt-3 flex justify-between items-center">
            <button 
              @click.stop="handleLikeClick(photo.id)"
              :disabled="likingInProgress[photo.id]"
              class="text-lg text-white hover:text-ncad-green transition-colors disabled:opacity-50"
            >
              {{ photo.likes || 0 }} Likes
            </button>
            <!-- Use denormalized authorName instead of fetching separately -->
            <span class="text-lg text-gray-400">by {{ photo.authorName || 'Anonymous' }}</span>
          </div>
        </div>

        <!-- Loading indicator for pagination -->
        <div v-if="galleryStore.loading" class="text-center py-8">
          <div class="text-gray-400">Loading more photos...</div>
        </div>

        <!-- End of photos indicator -->
        <div v-if="!galleryStore.hasMorePhotos && galleryStore.photos.length > 0" class="text-center py-8">
          <div class="text-gray-400">You've reached the end of the archive</div>
        </div>
      </div>
    </div>

    <!-- Floating CTA Button with Rainbow Styling -->
    <button 
      @click="handleUploadClick"
      class="rainbow-button fixed bottom-6 left-6 w-24 h-24 text-white flex items-center justify-center transition-all z-40 shadow-lg outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
    >
      <span class="text-4xl font-bold relative z-10">+</span>
    </button> 

    <!-- Screen Reveal Animation - Show after photos are loaded -->
    <RevealAnimation 
      v-if="showRevealAnimation" 
      @animation-complete="onAnimationComplete"
    />

    <!-- Device Detection Popup -->
    <DeviceDetectionPopup 
      ref="devicePopup"
      @close="onDevicePopupClose"
    />

    <!-- Welcome Popup -->
    <WelcomePopup 
      ref="welcomePopup"
      @close="onWelcomePopupClose"
    />

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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import MarqueeBanner from '../components/MarqueeBanner.vue'
import HamburgerMenu from '../components/HamburgerMenu.vue'
import RevealAnimation from '../components/RevealAnimation.vue'
import WelcomePopup from '../components/WelcomePopup.vue'
import DeviceDetectionPopup from '../components/DeviceDetectionPopup.vue'
import { lockOrientationToPortrait, showRotationWarning } from '../utils/deviceUtils'

const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const showPhotosLoading = ref(false)
const showRevealAnimation = ref(false)
const loadingProgress = ref('Loading photos...')
const hamburgerMenu = ref()
const welcomePopup = ref()
const devicePopup = ref()
const showGoneSoonModal = ref(false)
const selectedPhoto = ref(null)

// Like progress tracking
const likingInProgress = ref<Record<string, boolean>>({})

// Infinite scroll state
const isLoadingMore = ref(false)

// Check if we're coming from upload (to trigger reveal animation)
const isFromUpload = ref(false)

// Function to preload an image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`)
      resolve() // Resolve instead of reject to allow Promise.all to continue
    }
    img.src = src
  })
}

const handleUploadClick = () => {
  if (!authStore.user) {
    router.push('/login')
  } else {
    router.push('/upload')
  }
}

const handleLikeClick = async (photoId: string) => {
  if (!authStore.user) {
    router.push('/login')
    return
  }
  
  // Prevent multiple simultaneous like operations for this photo
  if (likingInProgress.value[photoId]) {
    return
  }
  
  likingInProgress.value[photoId] = true
  
  try {
    await galleryStore.toggleLike(photoId)
  } catch (error) {
    console.error('Error toggling like:', error)
  } finally {
    // Add a small delay to prevent rapid successive clicks
    setTimeout(() => {
      likingInProgress.value[photoId] = false
    }, 300)
  }
}

const navigateToPhoto = (photoId: string) => {
  router.push(`/photo/${photoId}`)
}

const onAnimationComplete = () => {
  showRevealAnimation.value = false
  // Start typewriter animation after reveal animation completes
  startTypewriterAnimation()
  
  // Show device detection popup first, then welcome popup
  setTimeout(() => {
    devicePopup.value?.showDevicePopup()
  }, 1000)
}

const onDevicePopupClose = () => {
  console.log('Device popup closed')
  // Show welcome popup after device popup is closed
  setTimeout(() => {
    welcomePopup.value?.showPopup()
  }, 500)
}

const onWelcomePopupClose = () => {
  console.log('Welcome popup closed')
}

// Handle image loading errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Image failed to load:', img.src)
}

// Infinite scroll functionality
const handleScroll = async () => {
  if (isLoadingMore.value || !galleryStore.hasMorePhotos || galleryStore.loading) {
    return
  }

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // Load more when user is 200px from bottom
  if (scrollTop + windowHeight >= documentHeight - 200) {
    isLoadingMore.value = true
    try {
      await galleryStore.loadPhotos(true) // true = load more
    } catch (error) {
      console.error('Error loading more photos:', error)
    } finally {
      isLoadingMore.value = false
    }
  }
}

// Typewriter animation function
const startTypewriterAnimation = () => {
  const element = document.getElementById("hero-typewriter")
  if (!element) {
    console.warn('Hero typewriter element not found')
    return
  }

  const lines = ["CREATIVE", "TRAILS", "ACROSS", "NCAD"]
  let currentLine = 0
  let currentChar = 0
  let fullText = ""

  function typeNextChar() {
    const currentWord = lines[currentLine]
    if (currentChar <= currentWord.length) {
      fullText = lines.slice(0, currentLine).join("<br>") +
                 (currentLine > 0 ? "<br>" : "") +
                 currentWord.slice(0, currentChar)

      element.innerHTML = fullText + '<span class="text-ncad-green animate-blink">|</span>'
      currentChar++
      setTimeout(typeNextChar, 100)
    } else {
      currentLine++
      currentChar = 0
      if (currentLine < lines.length) {
        setTimeout(typeNextChar, 400)
      } else {
        setTimeout(restartTyping, 4000)
      }
    }
  }

  function restartTyping() {
    currentLine = 0
    currentChar = 0
    fullText = ""
    element.innerHTML = ""
    setTimeout(typeNextChar, 400)
  }

  // Start typing
  typeNextChar()
}

// Check if we should show reveal animation
const shouldShowRevealAnimation = (): boolean => {
  // Show reveal animation if:
  // 1. Coming from upload (isFromUpload is true)
  // 2. First time visiting homepage (no session storage)
  return isFromUpload.value || !sessionStorage.getItem('ncad-archive-homepage-visited')
}

onMounted(async () => {
  try {
    // Initialize mobile optimizations
    lockOrientationToPortrait()
    showRotationWarning()
    
    // Check if coming from upload
    isFromUpload.value = sessionStorage.getItem('ncad-archive-from-upload') === 'true'
    
    // Clear the upload flag
    sessionStorage.removeItem('ncad-archive-from-upload')
    
    // Determine if we should show animations
    const shouldShowAnimations = shouldShowRevealAnimation()
    
    if (shouldShowAnimations) {
      // Show photos loading first
      showPhotosLoading.value = true
      loadingProgress.value = 'Fetching photos...'
      
      // Reset pagination state and load initial photos
      galleryStore.resetPagination()
      await galleryStore.loadPhotos()
      
      if (galleryStore.photos.length === 0) {
        // No photos to load, hide loading and show reveal animation
        showPhotosLoading.value = false
        showRevealAnimation.value = true
        return
      }
      
      // Get the top 5 most recent photos
      const topPhotos = galleryStore.photos.slice(0, 5)
      
      loadingProgress.value = 'Loading images...'
      
      // Preload the top 5 images
      const imagePromises = topPhotos.map((photo, index) => {
        return preloadImage(photo.imageURL).then(() => {
          loadingProgress.value = `Loading images... ${index + 1}/${topPhotos.length}`
        })
      })
      
      // Wait for all top 5 images to load
      await Promise.all(imagePromises)
      
      // Hide photos loading and show reveal animation
      showPhotosLoading.value = false
      
      // Small delay before showing reveal animation
      setTimeout(() => {
        showRevealAnimation.value = true
      }, 300)
      
      // Mark that homepage has been visited
      sessionStorage.setItem('ncad-archive-homepage-visited', 'true')
    } else {
      // No animations needed, just load photos normally
      await galleryStore.loadPhotos()
      
      // Start typewriter animation immediately
      setTimeout(() => {
        startTypewriterAnimation()
      }, 100)
    }
    
    // Add scroll listener for infinite scroll
    window.addEventListener('scroll', handleScroll, { passive: true })
    
  } catch (error) {
    console.error('Error loading initial content:', error)
    // Hide loading screens and show content even if there's an error
    showPhotosLoading.value = false
    showRevealAnimation.value = false
  }
})

onUnmounted(() => {
  // Clean up scroll listener
  window.removeEventListener('scroll', handleScroll)
})
</script>