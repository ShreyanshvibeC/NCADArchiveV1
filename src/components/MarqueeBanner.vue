<template>
  <div class="marquee-container cursor-pointer mobile-touch-feedback" @click="redirectToBolt">
    <div class="marquee-content">
      <span class="marquee-text">{{ repeatedText }}</span>
      <span class="marquee-text">{{ repeatedText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text?: string
}>()

const baseText = props.text || 'made on bolt.new'
const separator = ' ✦ '

const repeatedText = computed(() => {
  const fullText = baseText + separator
  return Array(12).fill(fullText).join('')
})

const redirectToBolt = () => {
  window.open('https://bolt.new/', '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.marquee-container {
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.marquee-content {
  display: flex;
  width: max-content;
  animation: marquee 25s linear infinite;
}

.marquee-text {
  font-size: 16px;
  color: #ffffff;
  font-family: 'Spenser', sans-serif;
  font-weight: 500;
  white-space: nowrap;
  padding-right: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .marquee-text {
    font-size: 14px;
  }
}
</style>