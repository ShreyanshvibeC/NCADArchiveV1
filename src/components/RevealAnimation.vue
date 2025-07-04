<template>
  <div class="fixed inset-0 z-50 min-h-screen w-full overflow-hidden">
    <!-- Animation Container - Vertical bars -->
    <div class="absolute inset-0 flex flex-row">
      <div
        v-for="(color, index) in colors"
        :key="index"
        :class="[
          'flex-1 h-full transform transition-transform duration-700 ease-in-out',
          color.bg,
          isAnimating ? getTranslateClass(index) : 'translate-y-0'
        ]"
        :style="{
          transitionDelay: `${index * 150}ms`,
          backgroundColor: color.hex
        }"
      >
        <div class="w-full h-full bg-gradient-to-b from-black/5 to-transparent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Color {
  bg: string
  hex: string
}

const colors: Color[] = [
  { bg: 'bg-red-500', hex: '#EF4444' },
  { bg: 'bg-orange-500', hex: '#F97316' },
  { bg: 'bg-yellow-500', hex: '#EAB308' },
  { bg: 'bg-green-500', hex: '#22C55E' },
  { bg: 'bg-blue-500', hex: '#3B82F6' },
  { bg: 'bg-purple-600', hex: '#9333EA' }
]

const emit = defineEmits<{
  'animation-complete': []
}>()

const isAnimating = ref(false)

const getTranslateClass = (index: number): string => {
  const isFromTop = index % 2 === 0
  return isFromTop ? '-translate-y-full' : 'translate-y-full'
}

onMounted(() => {
  // Start the animation after a brief delay
  setTimeout(() => {
    isAnimating.value = true
  }, 300)

  // Complete the animation and emit event
  setTimeout(() => {
    emit('animation-complete')
  }, 1500) // Total animation time: 300ms delay + 900ms staggered animation + 300ms buffer
})

// Support for reduced motion accessibility
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// If user prefers reduced motion, complete animation immediately
if (prefersReducedMotion) {
  setTimeout(() => {
    emit('animation-complete')
  }, 500)
}
</script>