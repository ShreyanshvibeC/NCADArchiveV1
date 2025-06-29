<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 mobile-safe-area">
    <!-- Enhanced Header -->
    <header class="flex items-center justify-between py-6">
      <button @click="$router.back()" class="p-3 text-white hover:text-purple-400 transition-all duration-300 glass-card-mobile mobile-touch-feedback" style="border-radius: 12px;">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none drop-shadow-lg">Sign In</h1>

      <div class="w-12"></div>
    </header>

    <!-- Main Content Container -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-8">
      <!-- Enhanced Login Form -->
      <div class="space-y-8">
        <div class="text-center space-y-6">
          <div class="relative">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome Back</h2>
            <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-20 blur-lg"></div>
          </div>
          <p class="text-gray-400 text-lg">
            Sign in to your NCAD Archive account
          </p>
        </div>

        <!-- Enhanced Image -->
        <div class="flex justify-center">
          <div class="relative">
            <img src="/image copy.png" alt="NCAD Archive" class="max-w-full h-auto rounded-xl shadow-2xl" />
            <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 blur-sm"></div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium mb-3 text-gray-300">NCAD Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="mobile-input"
              placeholder="your.name@ncad.ie"
            />
            <p class="text-xs text-gray-500 mt-2">Only NCAD email addresses (.ncad.ie) are allowed</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium mb-3 text-gray-300">Password</label>
            <input 
              v-model="password"
              type="password" 
              required
              class="mobile-input"
              placeholder="Enter your password"
            />
          </div>

          <!-- Enhanced Error Message -->
          <div v-if="error" class="glass-card-mobile p-4 border-l-4 border-red-500">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="btn-premium w-full mobile-touch-feedback"
          >
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="text-center space-y-4">
          <p class="text-gray-400 text-sm">Don't have an account?</p>
          <router-link 
            to="/signup"
            class="inline-block glass-card-mobile px-6 py-3 text-purple-400 hover:text-purple-300 text-sm font-medium transition-all duration-300 mobile-touch-feedback"
            style="border-radius: 12px;"
          >
            Create Account
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await authStore.login(email.value, password.value)
    
    if (result.success) {
      email.value = ''
      password.value = ''
      router.push('/')
    } else {
      error.value = result.error || 'Login failed'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>