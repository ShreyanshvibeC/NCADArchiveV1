<template>
  <!-- Upload Success Toast -->
  <div 
    v-if="isVisible" 
    class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out"
    :class="{ 
      'translate-y-0 opacity-100': isVisible && showToast, 
      '-translate-y-full opacity-0': !showToast 
    }"
  >
    <div class="bg-black border border-ncad-green px-6 py-4 shadow-lg max-w-sm mx-auto">
      <div class="flex items-center space-x-3">
        <!-- Success Icon -->
        <div class="w-8 h-8 bg-ncad-green rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        
        <!-- Message -->
        <div class="flex-1">
          <p class="text-white font-medium">{{ message }}</p>
          <p v-if="subtitle" class="text-gray-400 text-sm mt-1">{{ subtitle }}</p>
        </div>
        
        <!-- Close Button -->
        <button 
          @click="hideToast"
          class="text-gray-400 hover:text-white transition-colors ml-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isVisible: boolean
  message?: string
  subtitle?: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Uploaded successfully!',
  subtitle: 'Your photo has been added to the archive',
  duration: 4000
})

const emit = defineEmits<{
  'hide': []
}>()

const showToast = ref(false)

// Watch for visibility changes
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    // Show toast with a small delay for smooth animation
    setTimeout(() => {
      showToast.value = true
    }, 100)
    
    // Auto-hide after duration
    setTimeout(() => {
      hideToast()
    }, props.duration)
  } else {
    showToast.value = false
  }
})

const hideToast = () => {
  showToast.value = false
  
  // Wait for animation to complete before emitting hide event
  setTimeout(() => {
    emit('hide')
  }, 500)
}
</script>