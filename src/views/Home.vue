<template>
  <div class="mobile-scroll-smooth">
    <!-- Enhanced Marquee Banner -->
    <MarqueeBanner />

    <!-- Premium Fixed Header with Glass Morphism -->
    <header class="fixed top-[40px] left-0 right-0 z-30 glass-card-mobile border-0 border-b border-gray-600/30 backdrop-blur-xl">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <img 
              src="/logo -gif.gif" 
              alt="NCAD Logo" 
              class="h-8 cursor-pointer transition-transform duration-300 hover:scale-110 will-change-transform" 
              @error="handleImageError"
              @click="testWelcomePopup"
            />
            <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-20 blur-sm"></div>
          </div>
          <div class="relative">
            <svg class="h-6 drop-shadow-lg" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="15" fill="white" font-family="Spenser" font-size="18" font-weight="900" class="animate-text-glow">ARCHIVE</text>
            </svg>
          </div>
        </div>
        
        <!-- Enhanced Hamburger Button -->
        <button 
          @click="hamburgerMenu?.toggleMenu()"
          class="w-12 h-12 glass-card-mobile border border-gray-600/30 flex items-center justify-center hover:bg-white/10 transition-all duration-300 mobile-touch-feedback will-change-transform"
          style="border-radius: 12px;"
        >
          <div class="w-6 h-6 flex flex-col justify-center space-y-1">
            <div 
              class="w-full h-0.5 bg-white transition-all duration-300 will-change-transform"
              :class="{ 'rotate-45 translate-y-1.5': hamburgerMenu?.isOpen }"
            ></div>
            <div 
              class="w-full h-0.5 bg-white transition-all duration-300"
              :class="{ 'opacity-0': hamburgerMenu?.isOpen }"
            ></div>
            <div 
              class="w-full h-0.5 bg-white transition-all duration-300 will-change-transform"
              :class="{ '-rotate-45 -translate-y-1.5': hamburgerMenu?.isOpen }"
            ></div>
          </div>
        </button>
      </div>
    </header>

    <!-- Enhanced Hamburger Menu -->
    <HamburgerMenu ref="hamburgerMenu" />

    <!-- Main Content with Enhanced Mobile Optimizations -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-[100px] mobile-safe-area">
      <!-- Revolutionary Hero Section -->
      <section class="px-4 py-24 relative overflow-hidden">
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-float-mobile"></div>
          <div class="absolute bottom-20 right-10 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-float-mobile" style="animation-delay: 2s;"></div>
          <div class="absolute top-1/2 left-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-breathing"></div>
        </div>
        
        <!-- Enhanced Hero Content -->
        <div class="relative z-10">
          <div class="h-[240px] flex flex-col justify-start">
            <h1 id="hero-typewriter" class="text-5xl font-bold leading-none mb-6 min-h-[192px] will-change-contents"></h1>
          </div>
          
          <div class="space-y-8">
            <p class="text-gray-300 font-medium text-lg leading-relaxed animate-slide-in-up-mobile" style="animation-delay: 0.5s;">
              Follow the unseen threads<br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">of creativity across campus.</span>
            </p>
          </div>
        </div>
      </section>

      <!-- Enhanced Image Feed -->
      <div class="pb-24 px-4">
        <!-- Empty State with Premium Design -->
        <div v-if="galleryStore.photos.length === 0 && !galleryStore.loading" class="text-center py-12">
          <div class="premium-card max-w-sm mx-auto">
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              </svg>
            </div>
            <p class="text-gray-400 mb-4">No photos uploaded yet</p>
            <button 
              @click="handleUploadClick"
              class="btn-premium mobile-touch-feedback"
            >
              Upload the first photo
            </button>
          </div>
        </div>

        <!-- Enhanced Photo Grid -->
        <div 
          v-for="(photo, index) in galleryStore.photos" 
          :key="photo.id"
          class="mb-10 cursor-pointer premium-card mobile-touch-feedback will-change-transform"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="navigateToPhoto(photo.id)"
        >
          <!-- Enhanced Title -->
          <div v-if="photo.title" class="mb-4">
            <h2 class="text-2xl font-medium text-white text-left drop-shadow-lg">{{ photo.title }}</h2>
          </div>

          <!-- Premium Image Container -->
          <div class="relative w-full aspect-square overflow-hidden rounded-xl image-container">
            <img 
              :src="photo.imageURL" 
              :alt="photo.title || 'NCAD Archive Photo'"
              class="w-full h-full object-cover will-change-transform"
              loading="lazy"
              @error="handleImageError"
            />
            
            <!-- Enhanced Temporary Badge -->
            <div v-if="photo.temporary" class="absolute top-4 left-4 z-20">
              <button 
                @click.stop="showGoneSoonModal = true; selectedPhoto = photo"
                class="glass-card-mobile px-3 py-1 hover:bg-white/20 transition-all duration-300 mobile-touch-feedback"
                style="border-radius: 8px;"
              >
                <span class="text-xs font-medium text-white drop-shadow-lg">GONE SOON</span>
              </button>
            </div>

            <!-- Enhanced Visit Count with Premium Styling -->
            <div v-if="photo.location" class="absolute bottom-0 right-0 w-20 h-20 z-10">
              <div class="absolute inset-0 bg-gradient-to-tl from-black/60 via-transparent to-transparent rounded-tl-xl"></div>
              <div class="absolute right-3 bottom-3 flex flex-col items-center justify-center text-white z-20">
                <svg class="w-6 h-6 mb-1 drop-shadow-lg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="white"/>
                </svg>
                <span class="text-sm font-medium drop-shadow-lg">{{ photo.visits || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Enhanced Bottom Info -->
          <div class="mt-4 flex justify-between items-center">
            <button 
              @click.stop="handleLikeClick(photo.id)"
              :disabled="likingInProgress[photo.id]"
              class="flex items-center space-x-2 text-lg text-white hover:text-purple-400 transition-all duration-300 disabled:opacity-50 mobile-touch-feedback"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span>{{ photo.likes || 0 }} Likes</span>
            </button>
            <span class="text-lg text-gray-400">by {{ photo.authorName || 'Anonymous' }}</span>
          </div>
        </div>

        <!-- Enhanced Loading Indicator -->
        <div v-if="galleryStore.loading" class="text-center py-8">
          <div class="liquid-loader mb-4"></div>
          <div class="text-gray-400">Loading more photos...</div>
        </div>

        <!-- Enhanced End Indicator -->
        <div v-if="!galleryStore.hasMorePhotos && galleryStore.photos.length > 0" class="text-center py-8">
          <div class="premium-card max-w-sm mx-auto">
            <div class="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="text-gray-400">You've reached the end of the archive</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revolutionary Floating CTA Button -->
    <button 
      @click="handleUploadClick"
      class="rainbow-button-mobile bottom-6 left-6 w-16 h-16 text-white flex items-center justify-center transition-all z-40 shadow-lg outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 mobile-touch-feedback will-change-transform"
    >
      <span class="text-2xl font-bold relative z-10">+</span>
    </button> 

    <!-- Enhanced Reveal Animation -->
    <RevealAnimation 
      v-if="showRevealAnimation" 
      @animation-complete="onAnimationComplete"
    />

    <!-- Enhanced Welcome Popup -->
    <WelcomePopup 
      ref="welcomePopup"
      @close="onWelcomePopupClose"
    />

    <!-- Enhanced Gone Soon Modal -->
    <div v-if="showGoneSoonModal" class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-end justify-center z-50" @click="showGoneSoonModal = false">
      <div class="mobile-modal w-full max-w-md mx-auto p-6 space-y-6 transform transition-transform duration-300" 
           :class="{ 'translate-y-0': showGoneSoonModal, 'translate-y-full': !showGoneSoonModal }"
           @click.stop>
        
        <!-- Enhanced Handle bar -->
        <div class="w-12 h-1 bg-gray-500 mx-auto rounded-full"></div>
        
        <!-- Enhanced Header -->
        <div class="text-center">
          <h3 class="text-xl font-semibold text-white mb-2">Gone Soon</h3>
          <p class="text-sm text-gray-400">Temporary Content Information</p>
        </div>
        
        <!-- Enhanced Content -->
        <div class="space-y-4">
          <div class="glass-card-mobile p-4 border-l-4 border-purple-500">
            <p class="text-white text-sm">
              This photo features something <strong>temporary</strong> that may not be there when you visit the location.
            </p>
          </div>
          
          <div class="glass-card-mobile p-4 border-l-4 border-yellow-500">
            <p class="text-white text-sm">
              <strong class="text-yellow-400">Examples:</strong> Student artwork, temporary installations, exhibitions, events, or objects that are regularly moved or changed.
            </p>
          </div>
        </div>
        
        <!-- Enhanced Close Button -->
        <button 
          @click="showGoneSoonModal = false"
          class="btn-premium w-full mobile-touch-feedback"
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
import { useRouter } from 'vue-router'
import MarqueeBanner from '../components/MarqueeBanner.vue'
import HamburgerMenu from '../components/HamburgerMenu.vue'
import RevealAnimation from '../components/RevealAnimation.vue'
import WelcomePopup from '../components/WelcomePopup.vue'

const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const router = useRouter()

const initialImagesLoaded = ref(false)
const showRevealAnimation = ref(false)
const loadingProgress = ref('Loading photos...')
const hamburgerMenu = ref()
const welcomePopup = ref()
const showGoneSoonModal = ref(false)
const selectedPhoto = ref(null)

// Like progress tracking
const likingInProgress = ref<Record<string, boolean>>({})

// Infinite scroll state
const isLoadingMore = ref(false)

// Function to preload an image with enhanced error handling
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`)
      resolve()
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
  
  if (likingInProgress.value[photoId]) {
    return
  }
  
  likingInProgress.value[photoId] = true
  
  try {
    await galleryStore.toggleLike(photoId)
  } catch (error) {
    console.error('Error toggling like:', error)
  } finally {
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
  startTypewriterAnimation()
  
  setTimeout(() => {
    welcomePopup.value?.showPopup()
  }, 2000)
}

const onWelcomePopupClose = () => {
  console.log('Welcome popup closed')
}

const testWelcomePopup = () => {
  console.log('Logo clicked - showing welcome popup for testing')
  welcomePopup.value?.showPopupForTesting()
}

watch(initialImagesLoaded, (loaded) => {
  if (loaded) {
    showRevealAnimation.value = true
  }
})

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Image failed to load:', img.src)
}

// Enhanced infinite scroll with better performance
const handleScroll = async () => {
  if (isLoadingMore.value || !galleryStore.hasMorePhotos || galleryStore.loading) {
    return
  }

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  if (scrollTop + windowHeight >= documentHeight - 300) {
    isLoadingMore.value = true
    try {
      await galleryStore.loadPhotos(true)
    } catch (error) {
      console.error('Error loading more photos:', error)
    } finally {
      isLoadingMore.value = false
    }
  }
}

// Enhanced typewriter animation
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

      element.innerHTML = fullText + '<span class="text-purple-400 animate-blink-mobile">|</span>'
      currentChar++
      setTimeout(typeNextChar, 80)
    } else {
      currentLine++
      currentChar = 0
      if (currentLine < lines.length) {
        setTimeout(typeNextChar, 300)
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

  typeNextChar()
}

onMounted(async () => {
  try {
    loadingProgress.value = 'Fetching photos...'
    
    galleryStore.resetPagination()
    await galleryStore.loadPhotos()
    
    if (galleryStore.photos.length === 0) {
      initialImagesLoaded.value = true
      return
    }
    
    const topPhotos = galleryStore.photos.slice(0, 5)
    
    loadingProgress.value = 'Loading images...'
    
    const imagePromises = topPhotos.map((photo, index) => {
      return preloadImage(photo.imageURL).then(() => {
        loadingProgress.value = `Loading images... ${index + 1}/${topPhotos.length}`
      })
    })
    
    await Promise.all(imagePromises)
    
    initialImagesLoaded.value = true
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
  } catch (error) {
    console.error('Error loading initial content:', error)
    initialImagesLoaded.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.animate-text-glow {
  animation: text-glow 3s ease-in-out infinite;
}

.animate-slide-in-up-mobile {
  animation: slide-in-up-mobile 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}
</style>