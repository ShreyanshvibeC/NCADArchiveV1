<template>
  <div class="min-h-screen bg-black overflow-x-hidden">
    <!-- Header -->
    <header class="flex items-center justify-between bg-black py-4 px-4">
      <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none">About</h1>

      <div class="w-6"></div>
    </header>

    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
      
      <!-- Hero Section with Main Image -->
      <section class="relative">
        <!-- Hero Image -->
        <div class="w-full h-64 relative overflow-hidden">
          <img 
            src="/image copy copy copy copy copy copy copy copy copy copy copy copy copy.png" 
            alt="NCAD Archive - Student Photography Platform" 
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
      </section>

      <div class="px-4 space-y-8 py-8">
        <!-- What is NCAD Archive Section -->
        <section class="space-y-6">
          <div class="text-center space-y-4">
            <h3 class="text-2xl font-bold text-white">What is NCAD Archive?</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto"></div>
          </div>
          
          <div class="space-y-4 text-gray-300 leading-relaxed">
            <p class="text-lg">
              <strong class="text-white">NCAD Archive is a window into the creative soul of our campus.</strong> 
              It's a collaborative photography platform built exclusively for the NCAD community, where students capture and share the hidden gems, artistic moments, and vibrant life that makes our college unique.
            </p>
            
            <p>
              From spontaneous art installations in forgotten corners to the buzz of studio life, from quiet study nooks to explosive exhibition openings – let's document it all. Every photo tells a story, every location holds memories, and every moment captured adds to the creative legacy.
            </p>
          </div>
        </section>

        <!-- Why It Matters Section with Image -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">Why It Matters</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="grid grid-cols-1 gap-6">
            <div class="bg-ncad-dark-gray p-6 border-l-4 border-ncad-green">
              <h4 class="text-lg font-semibold text-white mb-3">🎨 Discover Hidden Creativity</h4>
              <p class="text-gray-300">
                Uncover student artwork, installations, and creative projects happening across campus that you might never have known existed.
              </p>
            </div>
            
            <div class="bg-ncad-dark-gray p-6 border-l-4 border-blue-500">
              <h4 class="text-lg font-semibold text-white mb-3">📍 Explore Your Campus</h4>
              <p class="text-gray-300">
                Find new study spots, art installations, and interesting corners of NCAD with location-tagged photos that guide you there.
              </p>
            </div>
            
            <div class="bg-ncad-dark-gray p-6 border-l-4 border-purple-500">
              <h4 class="text-lg font-semibold text-white mb-3">🤝 Connect with Community</h4>
              <p class="text-gray-300">
                See what your fellow students are creating, get inspired by their work, and contribute to our shared visual story.
              </p>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">How It Works</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-start space-x-4 bg-ncad-dark-gray p-4">
              <div class="w-8 h-8 bg-ncad-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">1</div>
              <div>
                <h4 class="text-white font-semibold mb-1">Capture & Share</h4>
                <p class="text-gray-300 text-sm">Take photos of interesting spots, artwork, or moments around campus and upload them with location data.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 bg-ncad-dark-gray p-4">
              <div class="w-8 h-8 bg-ncad-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">2</div>
              <div>
                <h4 class="text-white font-semibold mb-1">Explore & Discover</h4>
                <p class="text-gray-300 text-sm">Browse photos from other students, save interesting locations, and use the "Take Me There" feature to visit spots yourself.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 bg-ncad-dark-gray p-4">
              <div class="w-8 h-8 bg-ncad-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">3</div>
              <div>
                <h4 class="text-white font-semibold mb-1">Build Community</h4>
                <p class="text-gray-300 text-sm">Like, save, and share photos that inspire you or are proud of. Let's build a living archive of NCAD's creative culture!</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Community Guidelines Section -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">Community Guidelines</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="bg-ncad-dark-gray p-6 space-y-4">
            <div class="grid grid-cols-1 gap-4 text-sm">
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-lg">✓</span>
                <p class="text-gray-300"><strong class="text-white">Respect Privacy:</strong> Only photograph public spaces and willing participants</p>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-lg">✓</span>
                <p class="text-gray-300"><strong class="text-white">Stay Relevant:</strong> Keep content appropriate and related to campus life</p>
              </div>
            
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-lg">✓</span>
                <p class="text-gray-300"><strong class="text-white">Be Creative:</strong> Capture the unique spirit and energy of NCAD</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Section with Platform Styling and Animation -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">Our Growing Archive</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black border border-white p-6 text-center">
              <div class="text-3xl font-bold text-white mb-1">{{ animatedPhotos }}+</div>
              <div class="text-sm text-white">Creative Moments</div>
              <div class="text-xs text-gray-400 mt-1">Captured & Shared</div>
            </div>
            <div class="bg-black border border-white p-6 text-center">
              <div class="text-3xl font-bold text-white mb-1">{{ animatedStudents }}+</div>
              <div class="text-sm text-white">Community Members</div>
              <div class="text-xs text-gray-400 mt-1">Building Our Story</div>
            </div>
            <div class="bg-black border border-white p-6 text-center">
              <div class="text-3xl font-bold text-white mb-1">{{ animatedVisits }}+</div>
              <div class="text-sm text-white">Location Visits</div>
              <div class="text-xs text-gray-400 mt-1">Discoveries Made</div>
            </div>
            <div class="bg-black border border-white p-6 text-center">
              <div class="text-3xl font-bold text-white mb-1">{{ animatedLocations }}+</div>
              <div class="text-sm text-white">Campus Spots</div>
              <div class="text-xs text-gray-400 mt-1">Documented</div>
            </div>
          </div>
        </section>

        <!-- Contact & Info Section -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-xl font-bold text-white">Get in Touch</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="bg-ncad-dark-gray p-6 space-y-4 text-center">
            <div class="space-y-2 text-gray-300">
              <p><strong class="text-white">Questions or Feedback?</strong></p>
              <p>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf-MZETVdtnk2iJgHwr-iYh49HxBANgq4aIzxep3CfaefhQwQ/viewform?usp=sharing&ouid=101717117311011543340"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-ncad-green hover:text-opacity-80 transition-colors underline"
                >
                  Fill this form → Link
                </a>
              </p>
              <p>📍 100 Thomas Street, Dublin 8</p>
              <p>🌐 ncadarchive.me</p>
            </div>
            
            <div class="pt-4 border-t border-gray-700">
              <p class="text-sm text-gray-400">
                Built with ❤️ by the NCAD community, for the NCAD community
              </p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="text-center text-gray-500 text-sm pt-8 pb-8 border-t border-gray-600">
          <p>&copy; 2024 National College of Art and Design</p>
          <p class="mt-1">Preserving creativity, one photo at a time</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { collection, getDocs, getCountFromServer } from 'firebase/firestore'
import { db } from '../config/firebase'

const galleryStore = useGalleryStore()
const authStore = useAuthStore()

// Real statistics that will be fetched from the database
const totalPhotos = ref(0)
const totalStudents = ref(0)
const totalVisits = ref(0)
const campusLocations = ref(0)

// Animated values for the counters
const animatedPhotos = ref(0)
const animatedStudents = ref(0)
const animatedVisits = ref(0)
const animatedLocations = ref(0)

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Image failed to load:', img.src)
  // Hide the image if it fails to load
  img.style.display = 'none'
}

// Animation function for counting up numbers
const animateNumber = (from: number, to: number, duration: number, callback: (value: number) => void) => {
  const startTime = Date.now()
  const difference = to - from
  
  const step = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const currentValue = Math.floor(from + (difference * easeOutQuart))
    
    callback(currentValue)
    
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  
  requestAnimationFrame(step)
}

// Start animations when data is loaded
const startAnimations = () => {
  // Stagger the animations for a nice effect
  setTimeout(() => {
    animateNumber(0, totalPhotos.value, 2000, (value) => {
      animatedPhotos.value = value
    })
  }, 200)
  
  setTimeout(() => {
    animateNumber(0, totalStudents.value, 2000, (value) => {
      animatedStudents.value = value
    })
  }, 400)
  
  setTimeout(() => {
    animateNumber(0, totalVisits.value, 2000, (value) => {
      animatedVisits.value = value
    })
  }, 600)
  
  setTimeout(() => {
    animateNumber(0, campusLocations.value, 2000, (value) => {
      animatedLocations.value = value
    })
  }, 800)
}

const fetchRealStatistics = async () => {
  try {
    // Get total photos count
    const photosSnapshot = await getCountFromServer(collection(db, 'photos'))
    totalPhotos.value = photosSnapshot.data().count

    // Get total users count
    const usersSnapshot = await getCountFromServer(collection(db, 'users'))
    totalStudents.value = usersSnapshot.data().count

    // Get total visits by summing up visits from all photos
    const photosData = await getDocs(collection(db, 'photos'))
    let visits = 0
    let locationsWithData = 0
    
    photosData.forEach(doc => {
      const data = doc.data()
      visits += data.visits || 0
      if (data.location) {
        locationsWithData++
      }
    })
    
    totalVisits.value = visits
    campusLocations.value = locationsWithData

    console.log('Real statistics loaded:', {
      photos: totalPhotos.value,
      users: totalStudents.value,
      visits: totalVisits.value,
      locations: campusLocations.value
    })

    // Start animations after data is loaded
    startAnimations()
  } catch (error) {
    console.error('Error fetching statistics:', error)
    // Fallback to default values
    totalPhotos.value = 347
    totalStudents.value = 156
    totalVisits.value = 2840
    campusLocations.value = 89
    
    // Start animations with fallback data
    startAnimations()
  }
}

onMounted(async () => {
  await fetchRealStatistics()
})
</script>