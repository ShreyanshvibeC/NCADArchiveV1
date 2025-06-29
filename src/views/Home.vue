</div>

      <!-- Floating CTA Button with Rainbow Styling and Shimmer Effect -->
      <button 
        @click="handleUploadClick"
        class="rainbow-button fixed bottom-6 left-6 w-24 h-24 text-white flex items-center justify-center transition-all z-40 shadow-lg outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
      >
        <span class="text-4xl font-bold relative z-10">+</span>
      </button> 
    </div>

    <!-- Reveal Animation - Show after images are loaded, on top of main content -->
    <RevealAnimation 
      v-if="showRevealAnimation" 
      @animation-complete="onAnimationComplete"
    />
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

const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const router = useRouter()

const initialImagesLoaded = ref(false)
const showRevealAnimation = ref(false)
const loadingProgress = ref('Loading photos...')
const hamburgerMenu = ref()

// Like progress tracking
const likingInProgress = ref<Record<string, boolean>>({})

// Infinite scroll state
const isLoadingMore = ref(false)

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
}

// Watch for when initial images are loaded to trigger reveal animation
watch(initialImagesLoaded, (loaded) => {
  if (loaded) {
    showRevealAnimation.value = true
  }
})

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
  if (!element) return

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

onMounted(async () => {
  try {
    loadingProgress.value = 'Fetching photos...'
    
    // Reset pagination state and load initial photos
    galleryStore.resetPagination()
    await galleryStore.loadPhotos()
    
    if (galleryStore.photos.length === 0) {
      // No photos to load, show the page and trigger reveal animation
      initialImagesLoaded.value = true
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
    
    // Mark initial images as loaded - this will trigger the reveal animation
    initialImagesLoaded.value = true
    
    // Add scroll listener for infinite scroll
    window.addEventListener('scroll', handleScroll)
    
  } catch (error) {
    console.error('Error loading initial content:', error)
    // Show the main content even if there's an error
    initialImagesLoaded.value = true
  }
})

onUnmounted(() => {
  // Clean up scroll listener
  window.removeEventListener('scroll', handleScroll)
})
</script>