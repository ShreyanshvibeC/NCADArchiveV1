<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100]">
    <!-- Dark overlay with animated spotlight -->
    <div 
      class="absolute inset-0 bg-black transition-all duration-700 ease-in-out"
      :style="overlayStyle"
    ></div>
    
    <!-- Animated spotlight circle -->
    <div 
      v-if="showSpotlight"
      class="absolute border-4 border-white transition-all duration-700 ease-in-out pointer-events-none"
      :class="spotlightShape"
      :style="spotlightStyle"
    >
      <!-- Pulsing animation -->
      <div 
        class="absolute inset-0 border-4 border-white animate-ping opacity-30"
        :class="spotlightShape"
      ></div>
    </div>
    
    <!-- Animated tooltip -->
    <div 
      v-if="currentStep"
      class="absolute bg-black text-white p-4 max-w-xs shadow-2xl border border-gray-600 transition-all duration-500 ease-out transform"
      :style="tooltipStyle"
      :class="tooltipClasses"
    >
      <!-- Arrow pointing to target -->
      <div 
        class="absolute w-0 h-0 transition-all duration-300"
        :style="arrowStyle"
      ></div>
      
      <!-- Content -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg text-white">{{ currentStep.title }}</h3>
          <button 
            @click="skipTutorial"
            class="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Skip
          </button>
        </div>
        
        <p class="text-sm leading-relaxed text-gray-300">{{ currentStep.description }}</p>
        
        <!-- Action hint with animation -->
        <div v-if="currentStep.action" class="bg-gray-800 p-3 text-xs border-l-4 border-ncad-green">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-ncad-green rounded-full animate-pulse"></div>
            <span class="text-ncad-green font-medium">{{ currentStep.action }}</span>
          </div>
        </div>
        
        <!-- Page navigation indicator -->
        <div v-if="currentStep.navigateTo" class="bg-blue-900 bg-opacity-30 p-2 text-xs border border-blue-500">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
            <span class="text-blue-400">Moving to {{ currentStep.navigateTo }}...</span>
          </div>
        </div>
        
        <!-- Progress indicator -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex space-x-1">
            <div 
              v-for="(step, index) in steps" 
              :key="index"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="index === currentStepIndex ? 'bg-ncad-green scale-125' : index < currentStepIndex ? 'bg-gray-400' : 'bg-gray-600'"
            ></div>
          </div>
          
          <div class="text-xs text-gray-400">
            {{ currentStepIndex + 1 }} / {{ steps.length }}
          </div>
        </div>
        
        <!-- Navigation buttons -->
        <div class="flex items-center justify-between pt-2">
          <button 
            v-if="currentStepIndex > 0"
            @click="previousStep"
            class="px-3 py-1 text-sm bg-gray-700 text-white hover:bg-gray-600 transition-all duration-200 border border-gray-600"
          >
            Back
          </button>
          <div v-else></div>
          
          <button 
            @click="nextStep"
            :disabled="isNavigating"
            class="px-4 py-2 text-sm bg-ncad-green text-white hover:bg-opacity-80 transition-all duration-200 disabled:opacity-50 font-medium"
          >
            {{ isNavigating ? 'Moving...' : isLastStep ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

interface CoachmarkStep {
  id: string
  title: string
  description: string
  action?: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  offset?: { x: number; y: number }
  waitForElement?: boolean
  navigateTo?: string
  route?: string
  delay?: number
  shape?: 'circle' | 'rounded'
}

interface Props {
  steps: CoachmarkStep[]
  isVisible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'complete': []
  'skip': []
  'step-change': [stepIndex: number]
}>()

const router = useRouter()
const route = useRoute()

const currentStepIndex = ref(0)
const targetElement = ref<HTMLElement | null>(null)
const spotlightRect = ref({ x: 0, y: 0, width: 0, height: 0 })
const tooltipRect = ref({ x: 0, y: 0 })
const showSpotlight = ref(false)
const isNavigating = ref(false)

const currentStep = computed(() => props.steps[currentStepIndex.value])
const isLastStep = computed(() => currentStepIndex.value === props.steps.length - 1)

const spotlightShape = computed(() => {
  const shape = currentStep.value?.shape || 'rounded'
  return shape === 'circle' ? 'rounded-full' : 'rounded-lg'
})

const overlayStyle = computed(() => {
  if (!currentStep.value?.target || !targetElement.value || !showSpotlight.value) {
    return { opacity: '0.8' }
  }
  
  const rect = spotlightRect.value
  const padding = 15
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  const radius = Math.max(rect.width, rect.height) / 2 + padding
  
  const maskImage = `radial-gradient(circle at ${centerX}px ${centerY}px, transparent ${radius}px, black ${radius + 5}px)`
  
  return {
    opacity: '0.8',
    maskImage,
    WebkitMaskImage: maskImage
  }
})

const spotlightStyle = computed(() => {
  const rect = spotlightRect.value
  const padding = 15
  
  return {
    left: `${rect.x - padding}px`,
    top: `${rect.y - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
    transform: showSpotlight.value ? 'scale(1)' : 'scale(0.8)',
    opacity: showSpotlight.value ? 1 : 0
  }
})

const tooltipStyle = computed(() => {
  return {
    left: `${tooltipRect.value.x}px`,
    top: `${tooltipRect.value.y}px`
  }
})

const tooltipClasses = computed(() => {
  return showSpotlight.value ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
})

const arrowStyle = computed(() => {
  if (!currentStep.value || !targetElement.value) return {}
  
  const position = currentStep.value.position || 'bottom'
  
  const baseStyle = {
    borderWidth: '8px',
    borderStyle: 'solid'
  }
  
  switch (position) {
    case 'top':
      return {
        ...baseStyle,
        bottom: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderColor: 'black transparent transparent transparent'
      }
    case 'bottom':
      return {
        ...baseStyle,
        top: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderColor: 'transparent transparent black transparent'
      }
    case 'left':
      return {
        ...baseStyle,
        right: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderColor: 'transparent transparent transparent black'
      }
    case 'right':
      return {
        ...baseStyle,
        left: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderColor: 'transparent black transparent transparent'
      }
    default:
      return {}
  }
})

const findTargetElement = async (selector: string, maxAttempts = 50): Promise<HTMLElement | null> => {
  for (let i = 0; i < maxAttempts; i++) {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      return element
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return null
}

const updatePositions = async () => {
  if (!currentStep.value?.target) {
    showSpotlight.value = false
    return
  }
  
  await nextTick()
  
  // Find target element
  targetElement.value = await findTargetElement(currentStep.value.target)
  
  if (!targetElement.value) {
    console.warn(`Target element not found: ${currentStep.value.target}`)
    showSpotlight.value = false
    return
  }
  
  // Get target element position
  const rect = targetElement.value.getBoundingClientRect()
  spotlightRect.value = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
  
  // Calculate tooltip position
  const position = currentStep.value.position || 'bottom'
  const offset = currentStep.value.offset || { x: 0, y: 0 }
  const tooltipWidth = 320 // Approximate tooltip width
  const tooltipHeight = 200 // Approximate tooltip height
  
  let tooltipX = 0
  let tooltipY = 0
  
  switch (position) {
    case 'top':
      tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2
      tooltipY = rect.top - tooltipHeight - 20
      break
    case 'bottom':
      tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2
      tooltipY = rect.bottom + 20
      break
    case 'left':
      tooltipX = rect.left - tooltipWidth - 20
      tooltipY = rect.top + rect.height / 2 - tooltipHeight / 2
      break
    case 'right':
      tooltipX = rect.right + 20
      tooltipY = rect.top + rect.height / 2 - tooltipHeight / 2
      break
  }
  
  // Keep tooltip within viewport
  tooltipX = Math.max(16, Math.min(tooltipX + offset.x, window.innerWidth - tooltipWidth - 16))
  tooltipY = Math.max(16, Math.min(tooltipY + offset.y, window.innerHeight - tooltipHeight - 16))
  
  tooltipRect.value = { x: tooltipX, y: tooltipY }
  
  // Show spotlight with animation
  setTimeout(() => {
    showSpotlight.value = true
  }, 100)
}

const nextStep = async () => {
  if (isNavigating.value) return
  
  if (isLastStep.value) {
    completeTutorial()
    return
  }
  
  const nextStepData = props.steps[currentStepIndex.value + 1]
  
  // Check if we need to navigate to a different route
  if (nextStepData.route && route.path !== nextStepData.route) {
    isNavigating.value = true
    showSpotlight.value = false
    
    try {
      await router.push(nextStepData.route)
      
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      currentStepIndex.value++
      emit('step-change', currentStepIndex.value)
      
      // Wait for the new page to load, then update positions
      await new Promise(resolve => setTimeout(resolve, nextStepData.delay || 1000))
      await updatePositions()
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      isNavigating.value = false
    }
  } else {
    // Same page, just move to next step
    showSpotlight.value = false
    
    setTimeout(() => {
      currentStepIndex.value++
      emit('step-change', currentStepIndex.value)
      updatePositions()
    }, 300)
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    showSpotlight.value = false
    
    setTimeout(() => {
      currentStepIndex.value--
      emit('step-change', currentStepIndex.value)
      updatePositions()
    }, 300)
  }
}

const skipTutorial = () => {
  emit('skip')
}

const completeTutorial = () => {
  emit('complete')
}

// Watch for step changes
watch(() => currentStepIndex.value, () => {
  updatePositions()
})

// Watch for route changes
watch(() => route.path, () => {
  if (props.isVisible && currentStep.value) {
    setTimeout(() => {
      updatePositions()
    }, 500)
  }
})

// Handle window resize
const handleResize = () => {
  if (props.isVisible) {
    updatePositions()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  if (props.isVisible) {
    updatePositions()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Watch for visibility changes
watch(() => props.isVisible, (visible) => {
  if (visible) {
    currentStepIndex.value = 0
    updatePositions()
  } else {
    showSpotlight.value = false
  }
})
</script>