<template>
  <!-- Device Detection Popup -->
  <div v-if="showPopup" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
    <div class="bg-black border border-gray-600 w-full max-w-md mx-auto transform transition-transform duration-300" 
         :class="{ 'scale-100': showPopup, 'scale-95': !showPopup }"
         @click.stop>
      
      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Icon and Title -->
        <div class="text-center space-y-4">
          <div class="w-16 h-16 mx-auto bg-ncad-green bg-opacity-20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-ncad-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          
          <h2 class="text-xl font-bold text-white">Mobile Optimized Experience</h2>
        </div>
        
        <!-- Message -->
        <div class="space-y-4 text-gray-300">
          <p class="leading-relaxed">
            It looks like you're visiting from a <strong class="text-white">{{ deviceType }}</strong>. While our website is accessible on all devices, it's specifically optimized for mobile.
          </p>
          
          <p class="leading-relaxed">
            For the best experience—both visually and functionally—we strongly recommend switching to your <strong class="text-ncad-green">smartphone</strong>.
          </p>
          
          <div class="bg-gray-900 p-4 border-l-4 border-yellow-500">
            <p class="text-yellow-400 text-sm">
              <strong>Note:</strong> You can continue on your current device, but please note that the experience may be limited or not display as intended.
            </p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="space-y-3">
          <button 
            @click="continueAnyway"
            class="w-full bg-ncad-green text-white py-3 px-4 font-medium hover:bg-opacity-80 transition-all"
          >
            Continue on {{ deviceType }}
          </button>
          
          <button 
            @click="remindLater"
            class="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 transition-all border border-gray-600"
          >
            I'll Switch to Mobile Later
          </button>
        </div>
        
        <!-- Don't show again option -->
        <div class="text-center">
          <button 
            @click="dontShowAgain"
            class="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Don't show this again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  'close': []
}>()

const showPopup = ref(false)
const deviceType = ref('')

// Device detection function
const detectDevice = (): string => {
  const userAgent = navigator.userAgent.toLowerCase()
  const screenWidth = window.screen.width
  
  // Check for mobile devices first
  if (/android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile device'
  }
  
  // Check for tablets
  if (/ipad|tablet|kindle|silk|playbook/i.test(userAgent) || 
      (screenWidth >= 768 && screenWidth <= 1024)) {
    return 'tablet'
  }
  
  // Desktop/laptop detection
  if (screenWidth >= 1024) {
    return 'desktop'
  }
  
  // Fallback
  return 'device'
}

// Check if we should show the popup
const shouldShowPopup = (): boolean => {
  // Don't show if user has dismissed it permanently
  const dismissed = localStorage.getItem('ncad-archive-device-popup-dismissed')
  if (dismissed === 'true') {
    return false
  }
  
  // Don't show if user chose to be reminded later and it's been less than 24 hours
  const remindLaterTime = localStorage.getItem('ncad-archive-device-popup-remind-later')
  if (remindLaterTime) {
    const timeDiff = Date.now() - parseInt(remindLaterTime)
    const hoursElapsed = timeDiff / (1000 * 60 * 60)
    if (hoursElapsed < 24) {
      return false
    }
  }
  
  // Show popup for non-mobile devices
  const device = detectDevice()
  return device !== 'mobile device'
}

const continueAnyway = () => {
  showPopup.value = false
  emit('close')
  
  // Store that user chose to continue (don't remind for this session)
  sessionStorage.setItem('ncad-archive-device-popup-continued', 'true')
}

const remindLater = () => {
  showPopup.value = false
  emit('close')
  
  // Store timestamp to remind later (after 24 hours)
  localStorage.setItem('ncad-archive-device-popup-remind-later', Date.now().toString())
}

const dontShowAgain = () => {
  showPopup.value = false
  emit('close')
  
  // Permanently dismiss the popup
  localStorage.setItem('ncad-archive-device-popup-dismissed', 'true')
}

const showDevicePopup = () => {
  if (shouldShowPopup()) {
    deviceType.value = detectDevice()
    
    // Show popup after a short delay
    setTimeout(() => {
      showPopup.value = true
    }, 1000)
  }
}

// Expose function for parent component
defineExpose({
  showDevicePopup
})

onMounted(() => {
  deviceType.value = detectDevice()
})
</script>