<template>
  <div id="app" class="min-h-screen bg-black text-white">
    <HamburgerMenu />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import HamburgerMenu from './components/HamburgerMenu.vue'
</script>
@keyframes rainbow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.animate-rainbow {
  animation: rainbow 5s linear infinite;
}
