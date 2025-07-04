<template>
  <!-- Welcome Popup Overlay -->
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
      
      <!-- Welcome Image - Using new popup image -->
      <div class="w-full">
        <img 
          src="/popup-image.png" 
          alt="NCAD Archive Welcome - Create | Share | Explore" 
          class="w-full h-auto object-cover"
          @error="handleImageError"
        />
      </div>
      
      <!-- Content below image -->
      <div class="p-6 space-y-6">
        <!-- Main content -->
        <div class="space-y-4 text-gray-300">
          <p class="leading-relaxed">
            Hello! Hello! NCAD Archive is built exclusively for the <strong class="text-white">NCAD community</strong> — a space to share our work, explore hidden corners of our college, and most importantly discover what others are creating!
          </p>
          
          <!-- Visit icon explanation -->
          <div class="space-y-3">
            <div class="flex items-start space-x-3">
              <!-- Visit icon SVG -->
              <svg class="w-6 h-6 text-white mt-0.5 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="currentColor"/>
              </svg>
              <div>
                <p class="text-sm text-gray-400">
                See this icon? That means you can visit the exact location or artwork captured in the image.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div class="pt-4">
          <button 
            @click="closePopup"
            class="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 transition-all border border-white"
          >
            LET'S EXPLORE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'close': []
}>()

const isVisible = ref(false)

const closePopup = () => {
  isVisible.value = false
  emit('close')
  
  // Store in localStorage that user has seen the welcome popup
  localStorage.setItem('ncad-archive-welcome-shown', 'true')
}

const showPopup = () => {
  // Check if user has already seen the welcome popup
  const hasSeenWelcome = localStorage.getItem('ncad-archive-welcome-shown')
  
  if (!hasSeenWelcome) {
    // Show popup after 5 seconds
    setTimeout(() => {
      isVisible.value = true
    }, 5000)
  }
}

// For testing - show popup immediately
const showPopupForTesting = () => {
  isVisible.value = true
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Popup image failed to load:', img.src)
  // You could set a fallback or hide the image container
}

// Expose functions for parent component
defineExpose({
  showPopup,
  showPopupForTesting
})
</script>