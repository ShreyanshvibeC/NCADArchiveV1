<template>
  <div class="marquee-container">
    <div class="marquee-content">
      <span class="marquee-text">{{ repeatedText }}</span>
      <span class="marquee-text">{{ repeatedText }}</span> <!-- Duplicate -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text?: string
}>()

const baseText = props.text || 'made on bolt.new'
const separator = ' * '

const repeatedText = computed(() => {
  const fullText = baseText + separator
  return Array(10).fill(fullText).join('') // Not too many needed now
})
</script>

<style scoped>
.marquee-container {
  height: 40px;
  background-color: #ffffff;
  border-bottom: 1px solid #374151;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;

    display: flex;
  align-items: center;
}

.marquee-content {
  display: flex;
  width: max-content;
  animation: marquee 20s linear infinite;
}

.marquee-text {
  font-size: 18px;
  color: #000000;
  font-family: 'Spenser', sans-serif;
  font-weight: 400;
  white-space: nowrap;
  padding-right: 2rem; /* Optional spacing between duplicates */
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
