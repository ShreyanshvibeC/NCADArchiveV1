<template>
  <div class="min-h-screen bg-white">
    <!-- Main content area -->
    <div class="relative">
      <!-- Floating CTA Button -->
      <button 
        @click="handleUploadClick"
        class="rainbow-button fixed bottom-6 left-6 w-20 h-20 text-white flex items-center justify-center hover:bg-gray-900 transition-all z-40 shadow-lg relative"
      >
        <span class="text-4xl font-light relative z-10">+</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleUploadClick = () => {
  router.push('/upload')
}
</script>