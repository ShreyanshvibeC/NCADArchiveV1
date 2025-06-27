<template>
  <div 
    ref="imageContainer" 
    class="relative overflow-hidden"
    :class="containerClass"
  >
    <!-- Loading placeholder -->
    <div 
      v-if="!loaded && !error" 
      class="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center"
    >
      <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>
    
    <!-- Error state -->
    <div 
      v-if="error" 
      class="absolute inset-0 bg-gray-800 flex items-center justify-center"
    >
      <div class="text-center text-gray-400">
        <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-xs">Failed to load</p>
      </div>
    </div>
    
    <!-- Actual image -->
    <img
      v-show="loaded && !error"
      ref="imageElement"
      :alt="alt"
      :class="imageClass"
      class="w-full h-full object-cover transition-opacity duration-300"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createLazyLoader } from '../utils/performance'

interface Props {
  src: string
  alt: string
  containerClass?: string
  imageClass?: string
  eager?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  containerClass: '',
  imageClass: '',
  eager: false
})

const imageContainer = ref<HTMLElement>()
const imageElement = ref<HTMLImageElement>()
const loaded = ref(false)
const error = ref(false)
const observer = ref<IntersectionObserver>()

const onLoad = () => {
  loaded.value = true
  error.value = false
}

const onError = () => {
  error.value = true
  loaded.value = false
}

const loadImage = () => {
  if (imageElement.value && props.src) {
    imageElement.value.src = props.src
  }
}

onMounted(() => {
  if (props.eager) {
    // Load immediately for above-the-fold images
    loadImage()
  } else {
    // Use intersection observer for lazy loading
    observer.value = createLazyLoader((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target === imageContainer.value) {
          loadImage()
          observer.value?.unobserve(entry.target)
        }
      })
    })
    
    if (imageContainer.value) {
      observer.value.observe(imageContainer.value)
    }
  }
})

onUnmounted(() => {
  if (observer.value && imageContainer.value) {
    observer.value.unobserve(imageContainer.value)
  }
})
</script>