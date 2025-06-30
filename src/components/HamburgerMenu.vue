<template>
  <div v-if="showMenu">
    <!-- Menu Overlay -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-75 z-50"
      @click="isOpen = false"
    ></div>

    <!-- Menu Panel - Slides from Right -->
    <div 
      class="fixed top-0 right-0 h-full w-80 bg-black border-l border-gray-600 z-50 transform transition-transform duration-300"
      :class="{ 'translate-x-0': isOpen, 'translate-x-full': !isOpen }"
    >
      <!-- NCAD Archive Banner Image -->
      <div class="w-full">
        <img 
          src="/image copy copy copy copy copy copy copy copy copy copy.png" 
          alt="NCAD Archive" 
          class="w-full h-auto object-cover"
          @error="handleBannerError"
        />
      </div>
      
      <div class="p-4">
        <!-- Navigation Links -->
        <nav class="space-y-2 mb-8">
          <router-link 
            to="/" 
            @click="isOpen = false"
            class="flex items-center text-white hover:text-ncad-green transition-colors py-3 text-xl font-medium"
            :class="{ 'text-ncad-green': $route.name === 'Home' }"
          >
            <span>ARCHIVE</span>
          </router-link>

          <router-link 
            to="/about" 
            @click="isOpen = false"
            class="flex items-center text-white hover:text-ncad-green transition-colors py-3 text-xl font-medium"
            :class="{ 'text-ncad-green': $route.name === 'About' }"
          >
            <span>ABOUT</span>
          </router-link>

          <router-link 
            to="/profile" 
            @click="isOpen = false"
            class="flex items-center text-white hover:text-ncad-green transition-colors py-3 text-xl font-medium"
            :class="{ 'text-ncad-green': $route.name === 'Profile' }"
          >
            <span>PROFILE</span>
          </router-link>
        </nav>

        <!-- Authentication Section -->
        <div class="mt-8 pt-8 border-t border-gray-600">
          <div v-if="!authStore.isAuthenticated" class="space-y-3">
            <router-link 
              to="/login" 
              @click="isOpen = false"
              class="block w-full bg-ncad-green text-white text-center py-2 px-4 font-medium hover:bg-opacity-80 transition-all"
            >
              SIGN IN
            </router-link>
            <router-link 
              to="/signup" 
              @click="isOpen = false"
              class="block w-full bg-black text-white text-center py-2 px-4 font-medium hover:bg-ncad-dark-gray transition-all border border-white"
            >
              CREATE ACCOUNT
            </router-link>
          </div>
          <div v-else class="space-y-3">
            <div class="text-sm text-gray-400">
              Signed in as {{ authStore.user?.name || 'User' }}
            </div>
            <button 
              @click="handleLogout"
              class="w-full bg-black text-white text-center py-2 px-4 font-medium hover:bg-gray-700 transition-all border border-white"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const isOpen = ref(false)

// Only show hamburger menu on homepage
const showMenu = computed(() => {
  return route.name === 'Home'
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    isOpen.value = false
    router.push('/')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

const handleBannerError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Banner image failed to load:', img.src)
  // Hide the image if it fails to load
  img.style.display = 'none'
}

// Expose the toggle function and isOpen state for parent component
defineExpose({
  toggleMenu: () => {
    isOpen.value = !isOpen.value
  },
  isOpen
})
</script>