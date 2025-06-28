<template>
  <!-- Floating CTA Button -->
  <button 
    @click="handleUploadClick"
    class="rainbow-button fixed bottom-6 left-6 w-20 h-20 text-white flex items-center justify-center hover:bg-gray-900 transition-all z-40 shadow-lg relative"
  >
    <span class="text-4xl font-light relative z-10">+</span>
  </button>
</template>

<script setup lang="ts">
const handleUploadClick = () => {
  // Add your upload click logic here
  console.log('Upload button clicked');
};
</script>