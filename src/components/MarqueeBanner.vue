<template>
  <div class="marquee-container">
    <div class="marquee-content">
      <span class="marquee-text">{{ repeatedText }}</span>
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

// Create repeated text for seamless scrolling
const repeatedText = computed(() => {
  const fullText = baseText + separator
  // Repeat the text multiple times to ensure smooth endless scrolling
  return Array(20).fill(fullText).join('')
})
</script>

<style scoped>
.marquee-container {
  height: 40px;
  background-color: #000000;
  border-bottom: 1px solid #374151;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  width: 100%;
}

.marquee-content {
  display: inline-block;
  animation: marquee 30s linear infinite;
  line-height: 40px;
}

.marquee-text {
  font-size: 18px;
  color: #ffffff;
  font-family: 'Spenser', sans-serif;
  font-weight: 400;
}

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>