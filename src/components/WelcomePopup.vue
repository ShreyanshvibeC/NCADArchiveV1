<template>
  <!-- Welcome Popup Overlay - Vertically and horizontally centered -->
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" @click="closePopup">
    <div class="bg-black border border-gray-600 w-full max-w-md mx-auto transform transition-transform duration-300 relative" 
         :class="{ 'scale-100': isVisible, 'scale-95': !isVisible }"
         @click.stop>
      
      <!-- Close Button -->
      <button 
        @click="closePopup"
        class="absolute top-4 right-4 text-white hover:text-gray-400 transition-colors z-10"
      >
        <span class="text-xl font-black">X</span>
      </button>
      
      <!-- Image at the top -->
      <div class="w-full">
        <img 
          src="/popup image.png" 
          alt="NCAD Archive Welcome" 
          class="w-full h-auto object-cover"
          @error="handleImageError"
        />
      </div>
      
      <!-- Content below image -->
      <div class="p-6 space-y-6">
        <!-- Main content -->
        <div class="space-y-4 text-gray-300">
          <p class="leading-relaxed">
            Hello hello! Dive into the NCAD Archive — share your stuff, snoop around, and see what everyone's been up to.
          </p>
        </div>

        <!-- Carousel Section -->
        <div class="space-y-4">
          <div class="relative h-20 overflow-hidden">
            <!-- Carousel Container -->
            <div 
              class="flex transition-transform duration-500 ease-in-out h-full"
              :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            >
              <!-- Slide 1 - Visit Icon -->
              <div class="w-full flex-shrink-0 flex items-start space-x-3">
                <svg class="w-6 h-6 text-white mt-0.5 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="currentColor"/>
                </svg>
                <div>
                  <p class="text-sm text-gray-400">
                    See this icon? That means you can visit the exact location in the image, just follow the trails!
                  </p>
                </div>
              </div>

              <!-- Slide 2 - Heart Icon -->
              <div class="w-full flex-shrink-0 flex items-start space-x-3">
                <svg class="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <div>
                  <p class="text-sm text-gray-400">
                    On the Photo Page: Double tap to like, swipe to view description
                  </p>
                </div>
              </div>

              <!-- Slide 3 - Community Icon -->
              <div class="w-full flex-shrink-0 flex items-start space-x-3">
                <svg class="w-6 h-6 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7h-5c-.8 0-1.5.7-1.5 1.5v6c0 .8.7 1.5 1.5 1.5H16v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4zm6.5 0v-4h1v-4c0-.8-.7-1.5-1.5-1.5h-2c-.8 0-1.5.7-1.5 1.5v4h1v4h3z"/>
                </svg>
                <div>
                  <p class="text-sm text-gray-400">
                    Share your work. Explore what others are creating across NCAD.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Carousel Indicators -->
          <div class="flex justify-center space-x-2">
            <div 
              v-for="(slide, index) in 3" 
              :key="index"
              class="w-2 h-2 transition-colors duration-300"
              :class="currentSlide === index ? 'bg-white' : 'bg-gray-600'"
            ></div>
          </div>
        </div>
        
        <!-- CTA Buttons -->
        <div class="pt-4 space-y-3">
          <!-- Skip Button -->
          <button 
            @click="closePopup"
            class="w-full bg-ncad-green text-white py-3 px-4 font-medium hover:bg-opacity-80 transition-all"
          >
            LET'S EXPLORE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  'close': []
}>()

const isVisible = ref(false)
const currentSlide = ref(0)
const autoSlideInterval = ref<number | null>(null)

// Touch handling for swipe
const touchStartX = ref(0)
const touchEndX = ref(0)

// Device detection function
const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const closePopup = () => {
  isVisible.value = false
  stopAutoSlide()
  emit('close')
  
  // Store in sessionStorage that user has seen the welcome popup for this session
  sessionStorage.setItem('ncad-archive-welcome-shown', 'true')
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % 3
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const startAutoSlide = () => {
  autoSlideInterval.value = setInterval(() => {
    nextSlide()
  }, 3000) // 3 seconds
}

const stopAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}

// Touch event handlers for swipe
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  stopAutoSlide() // Stop auto-slide when user interacts
}

const handleTouchMove = (e: TouchEvent) => {
  // Prevent default to avoid scrolling
  e.preventDefault()
}

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].clientX
  handleSwipe()
  startAutoSlide() // Resume auto-slide after interaction
}

const handleSwipe = () => {
  const deltaX = touchEndX.value - touchStartX.value
  const minSwipeDistance = 50

  if (Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      // Swipe right - go to previous slide
      currentSlide.value = currentSlide.value === 0 ? 2 : currentSlide.value - 1
    } else {
      // Swipe left - go to next slide
      nextSlide()
    }
  }
}

const showPopup = () => {
  // Check if user has already seen the welcome popup in this session
  const hasSeenWelcome = sessionStorage.getItem('ncad-archive-welcome-shown')
  
  if (!hasSeenWelcome) {
    console.log('📱 Showing welcome popup - device type:', isMobileDevice() ? 'mobile' : 'desktop')
    isVisible.value = true
    currentSlide.value = 0 // Reset to first slide
    startAutoSlide()
  } else {
    console.log('📱 Welcome popup already shown in this session')
  }
}

// For testing - show popup immediately (can be used on any device for testing)
const showPopupForTesting = () => {
  isVisible.value = true
  currentSlide.value = 0 // Reset to first slide
  startAutoSlide()
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Popup image failed to load:', img.src)
}

// Cleanup on unmount
onUnmounted(() => {
  stopAutoSlide()
})

// Expose functions for parent component
defineExpose({
  showPopup,
  showPopupForTesting
})
</script>

<style scoped>
/* Prevent text selection during swipe */
.flex {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>