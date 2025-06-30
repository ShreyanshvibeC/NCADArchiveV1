<template>
  <div class="min-h-screen bg-black p-4">
    <!-- Header -->
    <header class="flex items-center justify-between bg-black py-4 px-4">
      <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none">Sign In</h1>

      <div class="w-6"></div>
    </header>

    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-8">
      <!-- Login Form -->
      <div class="space-y-6">
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-bold">Welcome Back</h2>
          <p class="text-gray-400">
            Sign in to your NCAD Archive account
          </p>
        </div>

        <!-- Image after the welcome text -->
        <div class="flex justify-center">
          <img src="/ncad-login-hero.png" alt="NCAD Archive" class="max-w-full h-auto" />
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">NCAD Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none transition-colors"
              placeholder="your.name@ncad.ie"
            />
            <p class="text-xs text-gray-500 mt-1">Use your NCAD email address</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <input 
              v-model="password"
              type="password" 
              required
              class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <!-- Error Message Display -->
          <div v-if="error" class="bg-red-900 bg-opacity-20 border border-red-500 p-3">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-ncad-green text-white py-3 font-medium hover:bg-opacity-80 transition-all disabled:opacity-50"
          >
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="text-center">
          <p class="text-gray-400 text-sm mb-2">Don't have an account?</p>
          <router-link 
            to="/signup"
            class="text-ncad-green hover:text-opacity-80 text-sm font-medium transition-colors"
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
      // Clear form
      email.value = ''
      password.value = ''
      // Redirect to home page
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