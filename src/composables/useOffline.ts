import { ref, onMounted, onUnmounted } from 'vue'
import { offlineManager } from '../utils/errorHandling'

export function useOffline() {
  const isOnline = ref(navigator.onLine)
  const showOfflineMessage = ref(false)
  
  let unsubscribe: (() => void) | null = null
  
  onMounted(() => {
    isOnline.value = offlineManager.getStatus()
    
    unsubscribe = offlineManager.onStatusChange((online) => {
      isOnline.value = online
      
      if (!online) {
        showOfflineMessage.value = true
      } else {
        // Hide offline message after coming back online
        setTimeout(() => {
          showOfflineMessage.value = false
        }, 3000)
      }
    })
  })
  
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
  
  return {
    isOnline,
    showOfflineMessage
  }
}