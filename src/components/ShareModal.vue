<template>
  <!-- Share Modal -->
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50" @click="closeModal">
    <div class="bg-gray-900 w-full max-w-md mx-auto p-4 space-y-4 transform transition-transform duration-300" 
         :class="{ 'translate-y-0': isVisible, 'translate-y-full': !isVisible }"
         @click.stop>
      
      <!-- Handle bar -->
      <div class="w-12 h-1 bg-gray-600 mx-auto mb-4"></div>
      
      <!-- Header -->
      <div class="text-center">
        <h3 class="text-lg font-semibold text-white">Share Photo</h3>
        <p class="text-sm text-gray-400 mt-1">{{ shareData?.title || 'NCAD Archive Photo' }}</p>
      </div>
      
      <!-- Share Message Preview -->
      <div v-if="shareData" class="bg-gray-800 p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
        <div class="font-medium text-white mb-2">Share Message Preview:</div>
        <div class="whitespace-pre-line">{{ shareMessagePreview }}</div>
      </div>
      
      <!-- CORS Status Info (only in development) -->
      <div v-if="showDebugInfo" class="bg-gray-800 p-3 text-xs text-gray-400 space-y-1">
        <div class="font-medium text-white mb-2">Debug Information:</div>
        <div>Native Share: {{ showNativeShare ? '✅ Yes' : '❌ No' }}</div>
        <div>Can Share Files: {{ canShareFiles ? '✅ Yes' : '❌ No' }}</div>
        <div>Mobile Device: {{ isMobileDevice() ? '✅ Yes' : '❌ No' }}</div>
        <div>CORS Status: {{ corsStatus }}</div>
        <div>Thumbnail Status: {{ thumbnailStatus }}</div>
        <div v-if="firebaseBucket" class="text-yellow-400">
          Firebase Bucket: {{ firebaseBucket }}
        </div>
        <div v-if="corsStatus.includes('Failed')" class="text-red-400 mt-2">
          ⚠️ CORS configuration needed for thumbnails
        </div>
      </div>
      
      <!-- CORS Warning (for users) -->
      <div v-if="showCorsWarning && !showDebugInfo" class="bg-yellow-900 bg-opacity-20 border border-yellow-500 p-3">
        <div class="flex items-start space-x-2">
          <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <p class="text-yellow-400 text-sm font-medium">Image sharing limited</p>
            <p class="text-yellow-300 text-xs mt-1">
              Thumbnails may not be included due to server configuration. Link sharing will still work.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Native Share Button (if supported) -->
      <button 
        v-if="showNativeShare"
        @click="handleNativeShare"
        :disabled="sharing"
        class="w-full bg-ncad-green text-black py-3 px-4 font-medium hover:bg-opacity-80 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
        </svg>
        <span>{{ sharing ? 'Preparing...' : getShareButtonText() }}</span>
      </button>
      
      <!-- Fallback Share Options -->
      <div v-if="showFallbackOptions" class="space-y-3">
        <div class="text-sm text-gray-400 text-center">
          {{ showNativeShare ? 'Or share via:' : 'Share via:' }}
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <!-- Copy Message -->
          <button 
            @click="copyMessage"
            class="bg-gray-800 text-white py-3 px-4 font-medium hover:bg-gray-700 transition-all flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm">Copy Message</span>
          </button>
          
          <!-- WhatsApp -->
          <button 
            @click="shareViaWhatsApp"
            class="bg-green-600 text-white py-3 px-4 font-medium hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span class="text-sm">WhatsApp</span>
          </button>
          
          <!-- Twitter -->
          <button 
            @click="shareViaTwitter"
            class="bg-blue-500 text-white py-3 px-4 font-medium hover:bg-blue-600 transition-all flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            <span class="text-sm">Twitter</span>
          </button>
          
          <!-- Facebook -->
          <button 
            @click="shareViaFacebook"
            class="bg-blue-600 text-white py-3 px-4 font-medium hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span class="text-sm">Facebook</span>
          </button>
          
          <!-- Email -->
          <button 
            @click="shareViaEmail"
            class="bg-gray-600 text-white py-3 px-4 font-medium hover:bg-gray-700 transition-all flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm">Email</span>
          </button>
          
          <!-- More Options -->
          <button 
            @click="showMoreOptions"
            class="bg-gray-700 text-white py-3 px-4 font-medium hover:bg-gray-600 transition-all flex items-center justify-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
            <span class="text-sm">More</span>
          </button>
        </div>
      </div>
      
      <!-- Success/Error Messages -->
      <div v-if="message" class="text-center">
        <p :class="messageType === 'success' ? 'text-green-400' : 'text-red-400'" class="text-sm">
          {{ message }}
        </p>
      </div>
      
      <!-- Cancel Button -->
      <button 
        @click="closeModal"
        class="w-full bg-gray-700 text-white py-3 px-4 font-medium hover:bg-gray-600 transition-all"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  sharePhoto, 
  fallbackShare, 
  isNativeShareSupported, 
  canShareFiles,
  getShareButtonText,
  isMobileDevice,
  testImageCORS,
  getFirebaseStorageBucket,
  createShareMessage,
  type ShareData 
} from '../utils/shareUtils'

interface Props {
  isVisible: boolean
  shareData: ShareData | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'close': []
  'shared': [success: boolean]
}>()

const sharing = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const corsStatus = ref('Not tested')
const thumbnailStatus = ref('Not tested')
const firebaseBucket = ref<string | null>(null)

// Show debug info in development
const showDebugInfo = ref(import.meta.env.DEV)

// Show CORS warning for users when thumbnails might not work
const showCorsWarning = computed(() => {
  return !showDebugInfo.value && corsStatus.value.includes('Failed')
})

const showNativeShare = computed(() => {
  return isNativeShareSupported() && isMobileDevice()
})

const showFallbackOptions = computed(() => {
  return !showNativeShare.value || message.value.includes('fallback') || message.value.includes('failed')
})

// Computed share message preview
const shareMessagePreview = computed(() => {
  if (!props.shareData) return ''
  return createShareMessage(props.shareData)
})

const handleNativeShare = async () => {
  if (!props.shareData) return
  
  sharing.value = true
  message.value = ''
  thumbnailStatus.value = 'Creating...'
  
  try {
    console.log('🚀 Starting native share process...')
    const success = await sharePhoto(props.shareData, false)
    
    if (success) {
      message.value = 'Shared successfully!'
      messageType.value = 'success'
      thumbnailStatus.value = 'Success'
      emit('shared', true)
      
      // Close modal after short delay
      setTimeout(() => {
        closeModal()
      }, 1000)
    } else {
      message.value = 'Native sharing failed. Use options below:'
      messageType.value = 'error'
      thumbnailStatus.value = 'Failed'
    }
  } catch (error: any) {
    console.error('❌ Share error:', error)
    message.value = 'Share failed. Use options below:'
    messageType.value = 'error'
    thumbnailStatus.value = 'Error'
  } finally {
    sharing.value = false
  }
}

const copyMessage = async () => {
  if (!props.shareData) return
  
  try {
    const success = await fallbackShare.copyLink(props.shareData)
    if (success) {
      message.value = 'Share message copied to clipboard!'
      messageType.value = 'success'
      emit('shared', true)
      
      // Close modal after short delay
      setTimeout(() => {
        closeModal()
      }, 1500)
    } else {
      message.value = 'Failed to copy message'
      messageType.value = 'error'
    }
  } catch (error) {
    message.value = 'Failed to copy message'
    messageType.value = 'error'
  }
}

const shareViaWhatsApp = () => {
  if (!props.shareData) return
  
  fallbackShare.whatsapp(props.shareData)
  emit('shared', true)
  closeModal()
}

const shareViaTwitter = () => {
  if (!props.shareData) return
  
  fallbackShare.twitter(props.shareData)
  emit('shared', true)
  closeModal()
}

const shareViaFacebook = () => {
  if (!props.shareData) return
  
  fallbackShare.facebook(props.shareData)
  emit('shared', true)
  closeModal()
}

const shareViaEmail = () => {
  if (!props.shareData) return
  
  fallbackShare.email(props.shareData)
  emit('shared', true)
  closeModal()
}

const showMoreOptions = () => {
  message.value = 'Copy the message above and paste it in your preferred app'
  messageType.value = 'success'
}

const closeModal = () => {
  message.value = ''
  corsStatus.value = 'Not tested'
  thumbnailStatus.value = 'Not tested'
  emit('close')
}

// Test image CORS and get Firebase bucket info when modal opens
onMounted(async () => {
  message.value = ''
  
  if (props.shareData) {
    // Get Firebase bucket info
    firebaseBucket.value = getFirebaseStorageBucket(props.shareData.imageUrl)
    
    // Test CORS
    try {
      corsStatus.value = 'Testing...'
      const corsWorking = await testImageCORS(props.shareData.imageUrl)
      corsStatus.value = corsWorking ? '✅ Working' : '❌ Failed'
    } catch (error) {
      corsStatus.value = '❌ Error'
      console.error('CORS test error:', error)
    }
  }
})
</script>