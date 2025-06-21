<template>
  <div class="min-h-screen bg-black p-4">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8 bg-black p-4 -m-4 mb-8">
      <button @click="$router.back()" class="text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="text-xl font-semibold">Create Account</h1>
      <div class="w-6"></div>
    </header>

    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
      <!-- Signup Form -->
      <div class="space-y-6">
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-bold">Join NCAD Archive</h2>
          <p class="text-gray-400">
            Create your account to start sharing and exploring photos
          </p>
          <div class="bg-ncad-green bg-opacity-20 border border-ncad-green p-3">
            <p class="text-ncad-green text-sm">
              Only NCAD email addresses (.ncad.ie) can create accounts
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Full Name</label>
            <input 
              v-model="name"
              type="text" 
              required
              class="w-full bg-gray-900 border border-gray-600 p-3 text-white focus:border-ncad-green focus:outline-none transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">NCAD Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="w-full bg-gray-900 border border-gray-600 p-3 text-white focus:border-ncad-green focus:outline-none transition-colors"
              :class="{ 'border-red-500': emailError }"
              placeholder="your.name@ncad.ie"
              @input="validateEmail"
            />
            <div class="mt-1">
              <p v-if="emailError" class="text-red-400 text-xs">{{ emailError }}</p>
              <p v-else class="text-gray-500 text-xs">Must end with .ncad.ie</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <input 
              v-model="password"
              type="password" 
              required
              minlength="6"
              class="w-full bg-gray-900 border border-gray-600 p-3 text-white focus:border-ncad-green focus:outline-none transition-colors"
              placeholder="Create a password (min 6 characters)"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Confirm Password</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              required
              minlength="6"
              class="w-full bg-gray-900 border border-gray-600 p-3 text-white focus:border-ncad-green focus:outline-none transition-colors"
              placeholder="Confirm your password"
            />
          </div>

          <!-- Error Message Display -->
          <div v-if="error" class="bg-red-900 bg-opacity-20 border border-red-500 p-3">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <!-- Success Message Display -->
          <div v-if="success" class="bg-ncad-green bg-opacity-20 border border-ncad-green p-3">
            <p class="text-ncad-green text-sm">{{ success }}</p>
          </div>

          <button 
            type="submit"
            :disabled="loading || emailError || !isValidForm"
            class="w-full bg-ncad-green text-black py-3 font-medium hover:bg-opacity-80 transition-all disabled:opacity-50"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="text-center">
          <p class="text-gray-400 text-sm mb-2">Already have an account?</p>
          <router-link 
            to="/login"
            class="text-ncad-green hover:text-opacity-80 text-sm font-medium transition-colors"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const emailError = ref('')

const isValidForm = computed(() => {
  return name.value && 
         email.value && 
         password.value && 
         confirmPassword.value && 
         password.value === confirmPassword.value &&
         !emailError.value
})

const validateEmail = () => {
  if (email.value && !authStore.validateNCADEmail(email.value)) {
    emailError.value = 'Email must end with .ncad.ie'
  } else {
    emailError.value = ''
  }
}

const handleSignup = async () => {
  // Clear previous messages
  error.value = ''
  success.value = ''
  
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  // Validate password length
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }
  
  // Validate NCAD email
  if (!authStore.validateNCADEmail(email.value)) {
    error.value = 'Only NCAD email addresses ending with .ncad.ie are allowed'
    return
  }
  
  loading.value = true
  
  try {
    const result = await authStore.register(email.value, password.value, name.value)
    
    if (result.success) {
      success.value = 'Account created successfully! Redirecting...'
      // Clear form
      name.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      error.value = result.error || 'Registration failed'
    }
  } catch (err) {
    console.error('Registration error:', err)
    error.value = 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>