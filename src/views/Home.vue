<template>
  <div class="min-h-screen bg-black">
    <!-- Marquee Banner at the very top - Always visible -->
    <MarqueeBanner text="made on bolt.new" />

    <!-- Loading Screen - Show until top 5 images are actually loaded -->
    <div v-if="!initialImagesLoaded" class="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div class="text-center space-y-4">
        <div class="text-2xl font-medium text-white">Loading the archive</div>
        <div class="flex justify-center space-x-1">
          <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-white rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
        <div class="text-sm text-gray-400 mt-2">{{ loadingProgress }}</div>
      </div>
    </div>

    <!-- Main Content - Only show when initial images are loaded -->
    <div v-else>
     
      <!-- Fixed Header with Logo on Left and Hamburger on Right - positioned below marquee -->
      <header class="fixed top-[40px] left-0 right-0 z-30 flex items-center justify-between p-4 border-b border-gray-600 bg-black">
        <div class="flex items-center">
          <img src="/logo -gif.gif" alt="NCAD Logo" class="h-8 mr-4" />
          <svg class="h-6" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="15" fill="white" font-family="Spenser" font-size="18" font-weight="900">ARCHIVE</text>
          </svg>
        </div>
        
        <!-- Hamburger Button - Vertically centered in header -->
        <button 
          @click="hamburgerMenu?.toggleMenu()"
          class="w-12 h-12 bg-black border border-gray-600 flex items-center justify-center hover:bg-gray-900 transition-colors"
        >
          <div class="w-6 h-6 flex flex-col justify-center space-y-1">
            <div 
              class="w-full h-0.5 bg-white transition-all duration-300"
              :class="{ 'rotate-45 translate-y-1.5': hamburgerMenu?.isOpen }"
            ></div>
            <div 
              class="w-full h-0.5 bg-white transition-all duration-300"
              :class="{ 'opacity-0': hamburgerMenu?.isOpen }"
            ></div>
            <div 
              class="w-full h-0.5 bg-white transition-all duration-300"
              :class="{ '-rotate-45 -translate-y-1.5': hamburgerMenu?.isOpen }"
            ></div>
          </div>
        </button>
      </header>

      <!-- Hamburger Menu Component -->
      <HamburgerMenu ref="hamburgerMenu" />

      <!-- Main Content Container with Desktop Margins and top padding for marquee + fixed header -->
      <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-[100px]">
        <!-- Hero Section -->
        <section class="px-4 py-24">
          <h1 class="text-5xl font-bold leading-none mb-6">
            CREATIVE<br>
            TRAILS<br>
            ACROSS<br>
            NCAD
          </h1>
          
          <!-- Hero Paragraph -->
          <div class="space-y-8">
            <p class="text-gray-400 font-medium text-lg leading-relaxed">
              Follow the unseen threads<br>
              of creativity across campus.
            </p>
          </div>
        </section>

        <!-- Image Feed -->
        <div class="pb-24">
          <div v-if="galleryStore.photos.length === 0" class="text-center py-12 text-gray-400">
            <p>No photos uploaded yet</p>
            <button 
              @click="handleUploadClick"
              class="inline-block mt-4 bg-ncad-green text-black px-6 py-2 font-medium hover:bg-opacity-80 transition-all"
            >
              Upload the first photo
            </button>
          </div>

          <div 
            v-for="photo in galleryStore.photos" 
            :key="photo.id"
            class="mb-10 cursor-pointer"
            @click="navigateToPhoto(photo.id)"
          >
            <!-- Title (if exists) - Left aligned -->
            <div v-if="photo.title" class="px-4 mb-2">
              <h2 class="text-2xl font-medium text-white text-left">{{ photo.title }}</h2>
            </div>

            <!-- Image Container - 1:1 aspect ratio with lazy loading -->
            <div class="relative w-full aspect-square overflow-hidden">
              <img 
                :src="photo.imageURL" 
                :alt="photo.title || 'NCAD Archive Photo'"
                class="w-full h-full object-cover lazy-image"
                loading="lazy"
                @load="onImageLoad"
                @error="onImageError"
              />
              
              <!-- Temporary Badge -->
              <div v-if="photo.temporary" class="absolute top-4 left-4 bg-gray-900 border border-ncad-green px-3 py-2 z-20">
                <span class="text-sm font-bold text-ncad-green">TEMPORARY SPOT</span>
              </div>

              <!-- Visit Count with Gradient -->
              <div class="absolute bottom-0 right-0 w-20 h-20 z-10">
                <!-- Diagonal gradient background -->
                <div class="absolute inset-0" style="background: linear-gradient(135deg, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.8) 100%);"></div>

                <!-- Icon and Count Container, Centered and Right-Aligned -->
                <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col items-center justify-center text-white z-20">
                  <svg class="w-6 h-6 mb-1" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="white"/>
                  </svg>
                  <span class="text-sm font-medium">{{ photo.visits || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Bottom Info - Likes left, Author right -->
            <div class="px-4 mt-3 flex justify-between items-center">
              <button 
                @click.stop="handleLikeClick(photo.id)"
                class="text-lg text-white hover:text-ncad-green transition-colors"
              >
                {{ photo.likes || 0 }} Likes
              </button>
              <span class="text-lg text-gray-400">by {{ userNames[photo.userId] || 'Loading...' }}</span>
            </div>
          </div>
        </div>
      </div>

            <!-- Floating CTA - Must be placed here, outside scrollable content -->
<button 
  @click="handleUploadClick"
  class="fixed bottom-6 left-6 w-20 h-20 text-white text-4xl font-light flex items-center justify-center z-50 shadow-lg
         cursor-pointer transition-all relative animate-rainbow
         bg-black
         bg-[linear-gradient(#000,#000),linear-gradient(#000_50%,rgba(0,0,0,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,#E40303,#FF8C00,#FFED00,#008026,#004CFF,#732982)]
         bg-[length:200%] [background-clip:padding-box,border-box,border-box]
         [background-origin:border-box] [border:calc(0.125rem)_solid_transparent]
         before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5
         before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,#E40303,#FF8C00,#FFED00,#008026,#004CFF,#732982)]
         before:[filter:blur(0.75rem)]"
>
  +
</button>

      
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import MarqueeBanner from '../components/MarqueeBanner.vue'
import HamburgerMenu from '../components/HamburgerMenu.vue'

const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const router = useRouter()
const userNames = ref<Record<string, string>>({})
const initialImagesLoaded = ref(false)
const loadingProgress = ref('Loading photos...')
const hamburgerMenu = ref()

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

const onImageLoad = () => {
  // Handle individual image load events if needed
}

const onImageError = () => {
  // Handle image load errors if needed
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
  
  try {
    await galleryStore.toggleLike(photoId)
  } catch (error) {
    console.error('Error toggling like:', error)
  }
}

const navigateToPhoto = (photoId: string) => {
  router.push(`/photo/${photoId}`)
}

onMounted(async () => {
  try {
    loadingProgress.value = 'Fetching photos...'
    
    // Load all photos first
    await galleryStore.loadPhotos()
    
    if (galleryStore.photos.length === 0) {
      // No photos to load, show the page immediately
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
    
    loadingProgress.value = 'Loading user data...'
    
    // Load user names for the top 5 photos
    const uniqueUserIds = [...new Set(topPhotos.map(photo => photo.userId))]
    for (const userId of uniqueUserIds) {
      userNames.value[userId] = await galleryStore.getUserName(userId)
    }
    
    // Mark initial images as loaded
    initialImagesLoaded.value = true
    
    // Continue loading remaining user names in the background
    const allUserIds = [...new Set(galleryStore.photos.map(photo => photo.userId))]
    const remainingUserIds = allUserIds.filter(id => !userNames.value[id])
    
    for (const userId of remainingUserIds) {
      userNames.value[userId] = await galleryStore.getUserName(userId)
    }
  } catch (error) {
    console.error('Error loading initial content:', error)
    // Show the page even if there's an error
    initialImagesLoaded.value = true
  }
})
</script>