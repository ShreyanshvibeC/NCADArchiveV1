<template>
  <div id="app" class="min-h-screen bg-black text-white">
    <HamburgerMenu />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import HamburgerMenu from './components/HamburgerMenu.vue'
</script>