<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100]">
    <!-- Dark overlay with proper cutout for interactive elements -->
    <div 
      class="absolute inset-0 bg-black transition-all duration-700 ease-in-out pointer-events-none"
      :style="overlayStyle"
    ></div>
    
    <!-- Interactive area - allows clicks through to target element -->
    <div 
      v-if="showSpotlight && targetElement"
      class="absolute pointer-events-none transition-all duration-700 ease-in-out"
      :style="interactiveAreaStyle"
    >
      <!-- Pulsing border animation around interactive area -->
      <div 
        class="absolute inset-0 border-4 border-white transition-all duration-700 ease-in-out"
        :class="spotlightShape"
        :style="{ opacity: showSpotlight ? 1 : 0 }"
      >
        <!-- Pulsing animation -->
        <div 
          class="absolute inset-0 border-4 border-white animate-ping opacity-30"
          :class="spotlightShape"
        ></div>
      </div>
    </div>
    
    <!-- Animated tooltip positioned to not cover interactive elements -->
    <div 
      v-if="currentStep"
      class="absolute bg-black text-white p-4 max-w-xs shadow-2xl border border-gray-600 transition-all duration-500 ease-out transform z-[101]"
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

// Create a proper cutout overlay that doesn't interfere with interactions
const overlayStyle = computed(() => {
  if (!currentStep.value?.target || !targetElement.value || !showSpotlight.value) {
    return { opacity: '0.8' }
  }
  
  const rect = spotlightRect.value
  const padding = 20
  
  // Create a cutout using clip-path instead of mask for better performance
  const clipPath = `polygon(
    0% 0%, 
    0% 100%, 
    ${rect.x - padding}px 100%, 
    ${rect.x - padding}px ${rect.y - padding}px, 
    ${rect.x + rect.width + padding}px ${rect.y - padding}px, 
    ${rect.x + rect.width + padding}px ${rect.y + rect.height + padding}px, 
    ${rect.x - padding}px ${rect.y + rect.height + padding}px, 
    ${rect.x - padding}px 100%, 
    100% 100%, 
    100% 0%
  )`
  
  return {
    opacity: '0.8',
    clipPath
  }
})

// Style for the interactive area that allows clicks through
const interactiveAreaStyle = computed(() => {
  const rect = spotlightRect.value
  const padding = 20
  
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
  
  // Calculate tooltip position to avoid covering the target element
  const position = currentStep.value.position || 'bottom'
  const offset = currentStep.value.offset || { x: 0, y: 0 }
  const tooltipWidth = 320
  const tooltipHeight = 250
  const padding = 30 // Extra padding to ensure no overlap
  
  let tooltipX = 0
  let tooltipY = 0
  
  switch (position) {
    case 'top':
      tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2
      tooltipY = rect.top - tooltipHeight - padding
      break
    case 'bottom':
      tooltipX = rect.left + rect.width / 2 - tooltipWidth / 2
      tooltipY = rect.bottom + padding
      break
    case 'left':
      tooltipX = rect.left - tooltipWidth - padding
      tooltipY = rect.top + rect.height / 2 - tooltipHeight / 2
      break
    case 'right':
      tooltipX = rect.right + padding
      tooltipY = rect.top + rect.height / 2 - tooltipHeight / 2
      break
  }
  
  // Ensure tooltip stays within viewport and doesn't cover target
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 16
  
  // Horizontal bounds checking
  if (tooltipX < margin) {
    tooltipX = margin
  } else if (tooltipX + tooltipWidth > viewportWidth - margin) {
    tooltipX = viewportWidth - tooltipWidth - margin
  }
  
  // Vertical bounds checking with special handling to avoid target overlap
  if (tooltipY < margin) {
    // If tooltip would go above viewport, try positioning below target
    if (position === 'top') {
      tooltipY = rect.bottom + padding
    } else {
      tooltipY = margin
    }
  } else if (tooltipY + tooltipHeight > viewportHeight - margin) {
    // If tooltip would go below viewport, try positioning above target
    if (position === 'bottom') {
      tooltipY = rect.top - tooltipHeight - padding
    } else {
      tooltipY = viewportHeight - tooltipHeight - margin
    }
  }
  
  // Final check to ensure tooltip doesn't overlap with target element
  const tooltipRect = {
    left: tooltipX,
    top: tooltipY,
    right: tooltipX + tooltipWidth,
    bottom: tooltipY + tooltipHeight
  }
  
  const targetRect = {
    left: rect.left - 20,
    top: rect.top - 20,
    right: rect.right + 20,
    bottom: rect.bottom + 20
  }
  
  // Check for overlap and adjust if necessary
  if (!(tooltipRect.right < targetRect.left || 
        tooltipRect.left > targetRect.right || 
        tooltipRect.bottom < targetRect.top || 
        tooltipRect.top > targetRect.bottom)) {
    
    // There's an overlap, try to reposition
    if (position === 'top' || position === 'bottom') {
      // Try positioning to the side
      if (rect.left > viewportWidth / 2) {
        tooltipX = rect.left - tooltipWidth - padding
      } else {
        tooltipX = rect.right + padding
      }
    } else {
      // Try positioning above or below
      if (rect.top > viewportHeight / 2) {
        tooltipY = rect.top - tooltipHeight - padding
      } else {
        tooltipY = rect.bottom + padding
      }
    }
  }
  
  tooltipRect.value = { 
    x: tooltipX + offset.x, 
    y: tooltipY + offset.y 
  }
  
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