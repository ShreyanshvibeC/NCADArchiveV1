<template>
  <div class="marquee-container">
    <div class="marquee-content">
      <span class="marquee-text">{{ fullTextContent }}</span>
      <span class="marquee-text">{{ fullTextContent }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text?: string
}>()

// Default text with asterisk separator
const baseText = props.text || 'made on bolt.new'
const separator = ' * '

// Create single instance of text with separator for duplication
const fullTextContent = computed(() => {
  return baseText + separator
})
</script>

<style scoped>
.marquee-container {
  height: 40px;
  background-color: #ffffff;
  border-bottom: 1px solid #374151;
  overflow: hidden;
  white-space: nowrap;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 40;
}

.marquee-content {
  display: flex;
  animation: marquee 30s linear infinite;
  line-height: 40px;
}

.marquee-text {
  font-size: 18px;
  color: #000000;
  font-family: 'Spenser', sans-serif;
  font-weight: 400;
  white-space: nowrap;
}

@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>