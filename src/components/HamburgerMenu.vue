<template>
  <div v-if="showMenu">
    <!-- Hamburger Button - Vertically centered in header area -->
    <button 
      @click="isOpen = !isOpen"
      class="fixed top-2 right-6 z-50 w-12 h-12 bg-black border border-gray-600 flex items-center justify-center hover:bg-gray-900 transition-colors"
    >
      <div class="w-6 h-6 flex flex-col justify-center space-y-1">
        <div 
          class="w-full h-0.5 bg-white transition-all duration-300"
          :class="{ 'rotate-45 translate-y-1.5': isOpen }"
        ></div>
        <div 
          class="w-full h-0.5 bg-white transition-all duration-300"
          :class="{ 'opacity-0': isOpen }"
        ></div>
        <div 
          class="w-full h-0.5 bg-white transition-all duration-300"
          :class="{ '-rotate-45 -translate-y-1.5': isOpen }"
        ></div>
      </div>
    </button>

    <!-- Menu Overlay -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-75 z-40"
      @click="isOpen = false"
    ></div>

    <!-- Menu Panel - Slides from Right -->
    <div 
      class="fixed top-0 right-0 h-full w-80 bg-black border-l border-gray-600 z-40 transform transition-transform duration-300"
      :class="{ 'translate-x-0': isOpen, 'translate-x-full': !isOpen }"
    >
      <div class="p-4 pt-20">
        <!-- Logo/Title -->
        <div class="mb-8">
          <img src="/logo -gif.gif" alt="NCAD Logo" class="h-8 mb-2" />
          <h2 class="text-xl font-semibold text-white">NCAD ARCHIVE</h2>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-2">
          <router-link 
            to="/" 
            @click="isOpen = false"
            class="flex items-center text-white hover:text-ncad-green transition-colors py-3 text-lg font-medium"
            :class="{ 'text-ncad-green': $route.name === 'Home' }"
          >
            <span>ARCHIVE</span>
          </router-link>

          <router-link 
            to="/about" 
            @click="isOpen = false"
            class="flex items-center text-white hover:text-ncad-green transition-colors py-3 text-lg font-medium"
            :class="{ 'text-ncad-green': $route.name === 'About' }"
          >
            <span>ABOUT</span>
          </router-link>

          <router-link 
            to="/profile" 
            @click="isOpen = false"
            class="flex items-center text-white hover:text-ncad-green transition-colors py-3 text-lg font-medium"
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
              class="block w-full bg-ncad-green text-black text-center py-2 px-4 font-medium hover:bg-opacity-80 transition-all"
            >
              SIGN IN
            </router-link>
            <router-link 
              to="/signup" 
              @click="isOpen = false"
              class="block w-full bg-gray-800 text-white text-center py-2 px-4 font-medium hover:bg-gray-700 transition-all border border-gray-600"
            >
              CREATE ACCOUNT
            </router-link>
          </div>
          <div v-else class="space-y-3">
            <div class="text-sm text-gray-400">
              Signed in as {{ authStore.user?.name }}
            </div>
            <button 
              @click="handleLogout"
              class="w-full bg-gray-800 text-white text-center py-2 px-4 font-medium hover:bg-gray-700 transition-all border border-gray-600"
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
  await authStore.logout()
  isOpen.value = false
  router.push('/')
}
</script>