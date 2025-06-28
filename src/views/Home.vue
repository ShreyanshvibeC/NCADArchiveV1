<template>
  <div class="min-h-screen bg-black overflow-x-hidden">
    <!-- Marquee Banner -->
    <MarqueeBanner text="made on bolt.new" />

    <!-- Main content area with top margin for marquee -->
    <div class="relative pt-10">
      <!-- Header with hamburger menu -->
      <header class="flex items-center justify-between p-4 bg-black">
        <div class="flex items-center space-x-4">
          <img src="/logo -gif.gif" alt="NCAD Logo" class="h-8" />
          <h1 class="text-xl font-semibold text-white">NCAD ARCHIVE</h1>
        </div>
        
        <button 
          @click="toggleMenu"
          class="p-2 text-white hover:text-gray-400 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </header>

      <!-- Main Content Container with Desktop Margins -->
      <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl px-4 pb-24">
        <!-- Loading State -->
        <div v-if="galleryStore.loading" class="flex justify-center items-center py-12">
          <div class="text-gray-400">Loading photos...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="galleryStore.photos.length === 0" class="text-center py-12">
          <p class="text-gray-400 mb-4">No photos in the archive yet</p>
          <router-link 
            v-if="authStore.isAuthenticated && authStore.user && authStore.user.uploadCount < 25"
            to="/upload" 
            class="bg-ncad-green text-black px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
          >
            Upload First Photo
          </router-link>
          <router-link 
            v-else-if="!authStore.isAuthenticated"
            to="/signup" 
            class="bg-ncad-green text-black px-6 py-3 font-medium hover:bg-opacity-80 transition-all"
          >
            Join to Upload
          </router-link>
        </div>

        <!-- Photo Grid -->
        <div v-else class="grid grid-cols-2 gap-4">
          <div 
            v-for="photo in galleryStore.photos" 
            :key="photo.id"
            class="relative cursor-pointer group"
            @click="$router.push(`/photo/${photo.id}`)"
          >
            <!-- Photo Image - 1:1 aspect ratio -->
            <img 
              :src="photo.imageURL" 
              :alt="photo.title || 'NCAD Archive Photo'"
              class="w-full aspect-square object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            
            <!-- Temporary Badge -->
            <div v-if="photo.temporary" class="absolute top-2 left-2 bg-black border border-ncad-green px-2 py-1 z-10">
              <span class="text-xs font-medium text-white">LEAVING SOON</span>
            </div>

            <!-- Photo Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
              <div class="flex items-center justify-between">
                <!-- Visit count -->
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-white" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="currentColor"/>
                  </svg>
                  <span class="text-white text-xs">{{ photo.visits }}</span>
                </div>
                
                <!-- Likes count -->
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span class="text-white text-xs">{{ photo.likes || 0 }}</span>
                </div>
              </div>
              
              <!-- Title if available -->
              <h3 v-if="photo.title" class="text-white text-sm font-medium mt-1 truncate">{{ photo.title }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Floating CTA Button with Rainbow Effect -->
      <button 
        @click="handleUploadClick"
        class="rainbow-button fixed bottom-6 left-6 w-20 h-20 text-white flex items-center justify-center transition-all z-40 shadow-lg relative"
        style="--color-1: #0066FF; --color-2: #00FF88; --color-3: #6B46C1; --color-4: #FF6B6B; --color-5: #FFD700;"
      >
        <span class="text-4xl font-light relative z-10">+</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import MarqueeBanner from '../components/MarqueeBanner.vue'
import HamburgerMenu from '../components/HamburgerMenu.vue'

const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const hamburgerMenu = ref()

onMounted(async () => {
  await galleryStore.loadPhotos()
})

const handleUploadClick = () => {
  if (!authStore.isAuthenticated) {
    router.push('/signup')
  } else if (authStore.user && authStore.user.uploadCount >= 25) {
    router.push('/profile')
  } else {
    router.push('/upload')
  }
}

const toggleMenu = () => {
  // Find the hamburger menu component and toggle it
  const menuComponent = document.querySelector('[data-hamburger-menu]')
  if (menuComponent) {
    menuComponent.dispatchEvent(new CustomEvent('toggle'))
  }
}
</script>