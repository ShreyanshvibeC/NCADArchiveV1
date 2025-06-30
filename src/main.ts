import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useGalleryStore } from './stores/gallery'
import { optimizeMobilePerformance, optimizeMobileBattery, addMobileBackgroundOptimization } from './utils/mobileUtils'
import { MobilePerformanceTracker } from './utils/mobilePerformance'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Global error handler for Vue
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
}

// Initialize mobile optimizations
optimizeMobilePerformance()
optimizeMobileBattery()

// Start mobile performance monitoring
MobilePerformanceTracker.startPerformanceMonitoring()

// Initialize auth state
try {
  const authStore = useAuthStore()
  authStore.initializeAuth()
  
  // Add mobile background optimization after stores are initialized
  const galleryStore = useGalleryStore()
  addMobileBackgroundOptimization(galleryStore)
} catch (error) {
  console.error('Error initializing auth store:', error)
}

app.mount('#app')