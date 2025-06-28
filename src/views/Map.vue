<template>
  <div class="h-screen bg-black relative">
    <!-- Header with Back Button -->
    <header class="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-[1000] bg-black bg-opacity-90">
      <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none">Campus Map</h1>

      <div class="w-6"></div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[999]">
      <div class="text-white">Loading map...</div>
    </div>

    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Location Warning Bottom Drawer -->
    <div v-if="showLocationDrawer" class="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-[1001]" @click="showLocationDrawer = false">
      <div class="bg-gray-900 w-full max-w-md mx-auto p-4 space-y-4" @click.stop>
        <div class="w-12 h-1 bg-gray-600 mx-auto mb-4"></div>
        
        <h3 class="text-lg font-semibold text-white text-center">Location Information</h3>
        
        <div class="space-y-4">
          <!-- Always show floor information -->
          <div class="bg-gray-800 p-4 border-l-4 border-ncad-accent">
            <p class="text-white text-sm">
              The Photo might be clicked on the 1st, 2nd, 3rd floor or the basement of the Campus, checking that might help!
            </p>
          </div>
          
          <!-- Show temporary spot warning only for temporary photos -->
          <div v-if="selectedPhoto?.temporary" class="bg-gray-800 p-4 border-l-4 border-yellow-500">
            <p class="text-white text-sm">
              The object might be removed from here as it comes under temporary spot.
            </p>
          </div>
        </div>
        
        <div class="flex space-x-3 pt-4">
          <button 
            @click="showLocationDrawer = false"
            class="flex-1 bg-gray-600 text-white py-3 font-medium hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="proceedToGoogleMaps"
            class="flex-1 bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors border border-white"
          >
            TAKE ME THERE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGalleryStore } from '../stores/gallery'
import L from 'leaflet'

const route = useRoute()
const galleryStore = useGalleryStore()
const mapContainer = ref<HTMLElement>()
const loading = ref(true)
const showLocationDrawer = ref(false)
const selectedPhoto = ref(null)
let map: L.Map | null = null

const showLocationWarning = (photo: any) => {
  selectedPhoto.value = photo
  showLocationDrawer.value = true
}

const proceedToGoogleMaps = () => {
  if (!selectedPhoto.value?.location) return
  
  // Close the drawer
  showLocationDrawer.value = false
  
  // Create Google Maps URL with coordinates
  const { lat, lng } = selectedPhoto.value.location
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=18`
  
  // Open in new tab/window
  window.open(googleMapsUrl, '_blank')
}

onMounted(async () => {
  if (!mapContainer.value) return

  try {
    // Load photos first
    await galleryStore.loadPhotos()
    
    // Initialize map centered on Dublin (NCAD area)
    map = L.map(mapContainer.value).setView([53.3498, -6.2603], 16)

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map)

    // Add photo markers
    const highlightId = route.query.highlight as string
    
    for (const photo of galleryStore.photos) {
      if (photo.location) {
        const isHighlighted = photo.id === highlightId
        
        // Get author name
        const authorName = await galleryStore.getUserName(photo.userId)
        
        const marker = L.marker([photo.location.lat, photo.location.lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div class="w-4 h-4 ${isHighlighted ? 'bg-ncad-accent' : 'bg-white'} border-2 border-black"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(map)

        marker.bindPopup(`
          <div class="bg-gray-900 text-white p-3 min-w-[200px]">
            <img src="${photo.imageURL}" alt="${photo.title || 'Photo'}" class="w-full h-24 object-cover mb-2" />
            ${photo.title ? `<h3 class="font-semibold mb-1">${photo.title}</h3>` : ''}
            <p class="text-sm text-gray-400 mb-1">${photo.visits} visits</p>
            <p class="text-sm text-gray-400 mb-2">by ${authorName}</p>
            <div class="flex space-x-2">
              <button onclick="window.location.href='/photo/${photo.id}'" class="bg-ncad-accent text-black px-3 py-1 text-sm font-medium hover:bg-opacity-80 flex-1">
                View Photo
              </button>
              <button onclick="window.showLocationWarning(${JSON.stringify(photo).replace(/"/g, '"')})" class="bg-gray-700 text-white px-3 py-1 text-sm font-medium hover:bg-gray-600 flex-1">
                TAKE ME THERE
              </button>
            </div>
          </div>
        `)

        if (isHighlighted) {
          map?.setView([photo.location.lat, photo.location.lng], 18)
          marker.openPopup()
        }
      }
    }

    // Make showLocationWarning function globally available for popup buttons
    (window as any).showLocationWarning = showLocationWarning
  } catch (error) {
    console.error('Error loading map:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
  // Clean up global function
  delete (window as any).showLocationWarning
})
</script>

<style>
.custom-marker {
  background: transparent !important;
  border: none !important;
}

.leaflet-popup-content-wrapper {
  background: #1f2937 !important;
  color: #ffffff !important;
  border: 1px solid #374151 !important;
  border-radius: 0 !important;
}

.leaflet-popup-tip {
  background: #1f2937 !important;
  border: 1px solid #374151 !important;
}

.leaflet-popup-close-button {
  color: #ffffff !important;
}
</style>