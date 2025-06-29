<template>
  <div v-if="showMenu">
    <!-- Enhanced Menu Overlay -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
      @click="isOpen = false"
    ></div>

    <!-- Revolutionary Menu Panel -->
    <div 
      class="fixed top-0 right-0 h-full w-80 glass-card-mobile border-l border-gray-600/30 z-40 transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) mobile-safe-area"
      :class="{ 'translate-x-0': isOpen, 'translate-x-full': !isOpen }"
      style="border-radius: 24px 0 0 24px;"
    >
      <!-- Enhanced NCAD Archive Banner -->
      <div class="w-full relative overflow-hidden" style="border-radius: 24px 0 0 0;">
        <img 
          src="/image copy copy copy copy copy copy copy copy copy copy.png" 
          alt="NCAD Archive" 
          class="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
          @error="handleBannerError"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      
      <div class="p-6 space-y-8">
        <!-- Enhanced Navigation Links -->
        <nav class="space-y-3">
          <router-link 
            to="/" 
            @click="isOpen = false"
            class="mobile-nav-item flex items-center text-white hover:text-purple-400 transition-all py-4 text-xl font-medium mobile-touch-feedback"
            :class="{ 'active text-purple-400': $route.name === 'Home' }"
          >
            <svg class="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span>ARCHIVE</span>
          </router-link>

          <router-link 
            to="/about" 
            @click="isOpen = false"
            class="mobile-nav-item flex items-center text-white hover:text-purple-400 transition-all py-4 text-xl font-medium mobile-touch-feedback"
            :class="{ 'active text-purple-400': $route.name === 'About' }"
          >
            <svg class="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>ABOUT</span>
          </router-link>

          <router-link 
            to="/profile" 
            @click="isOpen = false"
            class="mobile-nav-item flex items-center text-white hover:text-purple-400 transition-all py-4 text-xl font-medium mobile-touch-feedback"
            :class="{ 'active text-purple-400': $route.name === 'Profile' }"
          >
            <svg class="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>PROFILE</span>
          </router-link>
        </nav>

        <!-- Enhanced Authentication Section -->
        <div class="pt-6 border-t border-gray-600/30">
          <div v-if="!authStore.isAuthenticated" class="space-y-4">
            <router-link 
              to="/login" 
              @click="isOpen = false"
              class="btn-premium w-full text-center mobile-touch-feedback block"
            >
              SIGN IN
            </router-link>
            <router-link 
              to="/signup" 
              @click="isOpen = false"
              class="block w-full glass-card-mobile text-white text-center py-3 px-4 font-medium hover:bg-white/10 transition-all border border-white/20 mobile-touch-feedback"
              style="border-radius: 12px;"
            >
              CREATE ACCOUNT
            </router-link>
          </div>
          <div v-else class="space-y-4">
            <div class="glass-card-mobile p-4" style="border-radius: 12px;">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-sm">{{ getUserInitials(authStore.user?.name || 'User') }}</span>
                </div>
                <div>
                  <div class="text-sm text-gray-400">Signed in as</div>
                  <div class="text-white font-medium">{{ authStore.user?.name || 'User' }}</div>
                </div>
              </div>
            </div>
            <button 
              @click="handleLogout"
              class="w-full glass-card-mobile text-white text-center py-3 px-4 font-medium hover:bg-red-500/20 transition-all border border-red-500/30 mobile-touch-feedback"
              style="border-radius: 12px;"
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

const showMenu = computed(() => {
  return route.name === 'Home'
})

const getUserInitials = (name: string) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

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
  img.style.display = 'none'
}

defineExpose({
  toggleMenu: () => {
    isOpen.value = !isOpen.value
  },
  isOpen
})
</script>