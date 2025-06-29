<template>
  <!-- Welcome Popup Overlay -->
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-black border border-gray-600 w-full max-w-md mx-auto p-6 space-y-6 transform transition-transform duration-300" 
         :class="{ 'scale-100': isVisible, 'scale-95': !isVisible }">
      
      <!-- Header with emoji -->
      <div class="text-center">
        <div class="text-4xl mb-4">🎉</div>
        <h2 class="text-2xl font-bold text-white mb-4">Welcome to the NCAD Archive!</h2>
      </div>
      
      <!-- Main content -->
      <div class="space-y-4 text-gray-300">
        <p class="leading-relaxed">
          This platform is built exclusively for the <strong class="text-white">NCAD community</strong> — a space to share your work, explore hidden corners of NCAD, and discover what others are creating.
        </p>
        
        <!-- Use the platform section -->
        <div class="space-y-3">
          <div class="flex items-start space-x-3">
            <span class="text-xl">🧭</span>
            <div>
              <p class="text-white font-medium mb-2">Use the platform to:</p>
              <ul class="space-y-1 text-sm">
                <li>• Upload and showcase your own creative work</li>
                <li>• Explore projects by others</li>
                <li>• Document unique and hidden places in the NCAD campus</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Visit icon explanation -->
        <div class="space-y-3">
          <div class="flex items-start space-x-3">
            <span class="text-xl">👀</span>
            <div>
              <p class="text-white font-medium mb-2">What does the "Visit" icon mean?</p>
              <p class="text-sm">
                The visit icon indicates how many times a particular project or location has been viewed by others in the community.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Call to action text -->
        <div class="text-center pt-4">
          <p class="text-white font-bold text-lg">Create and Share!</p>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div class="pt-4">
        <button 
          @click="closePopup"
          class="w-full bg-ncad-green text-black py-3 px-4 font-medium hover:bg-opacity-80 transition-all"
        >
          Let's explore
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

// Expose the showPopup function for parent component
defineExpose({
  showPopup
})
</script>