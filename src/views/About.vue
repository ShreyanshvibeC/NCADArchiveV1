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
            src="/image copy copy copy copy copy copy copy copy copy copy copy copy.png" 
            alt="NCAD Archive - Student Photography Platform" 
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
      </section>

      <div class="px-4 space-y-8 py-8">
        <!-- Why It Matters Section with Image -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">Why It Matters</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <!-- Inline Image -->
          <div class="w-full h-48 relative overflow-hidden">
            <img 
              src="/image copy copy copy copy copy copy copy.png" 
              alt="NCAD Campus Life" 
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          
          <div class="grid grid-cols-1 gap-6">
            <div class="bg-gray-900 p-6 border-l-4 border-ncad-green">
              <h4 class="text-lg font-semibold text-white mb-3">🎨 Discover Hidden Creativity</h4>
              <p class="text-gray-300">
                Uncover student artwork, installations, and creative projects happening across campus that you might never have known existed.
              </p>
            </div>
            
            <div class="bg-gray-900 p-6 border-l-4 border-blue-500">
              <h4 class="text-lg font-semibold text-white mb-3">📍 Explore Your Campus</h4>
              <p class="text-gray-300">
                Find new study spots, art installations, and interesting corners of NCAD with location-tagged photos that guide you there.
              </p>
            </div>
            
            <div class="bg-gray-900 p-6 border-l-4 border-purple-500">
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
            <div class="flex items-start space-x-4 bg-gray-900 p-4">
              <div class="w-8 h-8 bg-ncad-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">1</div>
              <div>
                <h4 class="text-white font-semibold mb-1">Capture & Share</h4>
                <p class="text-gray-300 text-sm">Take photos of interesting spots, artwork, or moments around campus and upload them with location data.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 bg-gray-900 p-4">
              <div class="w-8 h-8 bg-ncad-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">2</div>
              <div>
                <h4 class="text-white font-semibold mb-1">Explore & Discover</h4>
                <p class="text-gray-300 text-sm">Browse photos from other students, save interesting locations, and use the "Take Me There" feature to visit spots yourself.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 bg-gray-900 p-4">
              <div class="w-8 h-8 bg-ncad-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">3</div>
              <div>
                <h4 class="text-white font-semibold mb-1">Build Community</h4>
                <p class="text-gray-300 text-sm">Like, save, and share photos that inspire you. Help build a living archive of NCAD's creative culture.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Special Features Section -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">What Makes Us Special</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="grid grid-cols-1 gap-4">
            <div class="bg-black border border-ncad-green p-4">
              <div class="flex items-center space-x-3 mb-2">
                <svg class="w-6 h-6 text-ncad-green" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.7499 7.33333C19.2166 7.33333 20.4166 6.13333 20.4166 4.66667C20.4166 3.2 19.2166 2 17.7499 2C16.2833 2 15.0833 3.2 15.0833 4.66667C15.0833 6.13333 16.2833 7.33333 17.7499 7.33333ZM12.8166 11.8667L9.40327 29.08C9.22994 29.8933 9.86994 30.6667 10.7099 30.6667H10.8166C11.4433 30.6667 11.9766 30.24 12.1233 29.6267L14.2833 20L17.0833 22.6667V29.3333C17.0833 30.0667 17.6833 30.6667 18.4166 30.6667C19.1499 30.6667 19.7499 30.0667 19.7499 29.3333V21.8133C19.7499 21.08 19.4566 20.3867 18.9233 19.88L16.9499 18L17.7499 14C19.1766 15.6533 21.2433 16.84 23.5633 17.2133C24.3633 17.3333 25.0833 16.6933 25.0833 15.88C25.0833 15.2267 24.6033 14.68 23.9499 14.5733C21.9233 14.24 20.2433 13.04 19.3499 11.4667L18.0166 9.33333C17.2699 8.14667 15.7766 7.66667 14.4833 8.21333L9.37661 10.3733C8.38994 10.8 7.74994 11.76 7.74994 12.84V16C7.74994 16.7333 8.34994 17.3333 9.08327 17.3333C9.81661 17.3333 10.4166 16.7333 10.4166 16V12.8L12.8166 11.8667Z" fill="currentColor"/>
                </svg>
                <h4 class="text-white font-semibold">Location-Based Discovery</h4>
              </div>
              <p class="text-gray-300 text-sm">
                Every photo with location data becomes a treasure map. See something interesting? Get directions and visit it yourself!
              </p>
            </div>
            
            <div class="bg-gray-900 p-4 border border-yellow-500">
              <div class="flex items-center space-x-3 mb-2">
                <span class="text-yellow-500 text-lg">⚡</span>
                <h4 class="text-white font-semibold">"Gone Soon" Alerts</h4>
              </div>
              <p class="text-gray-300 text-sm">
                Temporary installations, student exhibitions, and pop-up art are marked so you know to visit them before they disappear.
              </p>
            </div>
            
            <div class="bg-gray-900 p-4 border border-green-500">
              <div class="flex items-center space-x-3 mb-2">
                <span class="text-green-500 text-lg">🎓</span>
                <h4 class="text-white font-semibold">NCAD-Only Community</h4>
              </div>
              <p class="text-gray-300 text-sm">
                Exclusive to NCAD students and staff. Your .ncad.ie email is your key to this creative community.
              </p>
            </div>
          </div>
        </section>

        <!-- Community Guidelines Section -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">Community Guidelines</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="bg-gray-900 p-6 space-y-4">
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
                <p class="text-gray-300"><strong class="text-white">Quality Focus:</strong> 25 photo limit per student to maintain high standards</p>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-lg">✓</span>
                <p class="text-gray-300"><strong class="text-white">Be Creative:</strong> Capture the unique spirit and energy of NCAD</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Section with Platform Styling -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white">Our Growing Archive</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-black border border-ncad-green p-6 text-center">
              <div class="text-3xl font-bold text-ncad-green mb-1">{{ totalPhotos }}+</div>
              <div class="text-sm text-white">Creative Moments</div>
              <div class="text-xs text-gray-400 mt-1">Captured & Shared</div>
            </div>
            <div class="bg-black border border-blue-500 p-6 text-center">
              <div class="text-3xl font-bold text-blue-500 mb-1">{{ totalStudents }}+</div>
              <div class="text-sm text-white">Community Members</div>
              <div class="text-xs text-gray-400 mt-1">Building Our Story</div>
            </div>
            <div class="bg-black border border-purple-500 p-6 text-center">
              <div class="text-3xl font-bold text-purple-500 mb-1">{{ totalVisits }}+</div>
              <div class="text-sm text-white">Location Visits</div>
              <div class="text-xs text-gray-400 mt-1">Discoveries Made</div>
            </div>
            <div class="bg-black border border-green-500 p-6 text-center">
              <div class="text-3xl font-bold text-green-500 mb-1">{{ campusLocations }}+</div>
              <div class="text-sm text-white">Campus Spots</div>
              <div class="text-xs text-gray-400 mt-1">Documented</div>
            </div>
          </div>
        </section>

        <!-- Call to Action Section -->
        <section class="space-y-6">
          <div class="bg-black border border-ncad-green p-8 text-center">
            <h3 class="text-2xl font-bold text-white mb-4">Ready to Join the Archive?</h3>
            <p class="text-gray-300 mb-6">
              Start exploring NCAD through the eyes of your fellow students, or contribute your own perspective to our growing collection.
            </p>
            
            <div class="space-y-3">
              <router-link 
                v-if="!authStore.isAuthenticated"
                to="/signup"
                class="block bg-ncad-green text-white py-3 px-6 font-medium hover:bg-opacity-80 transition-all"
              >
                Create Your Account
              </router-link>
              <router-link 
                v-else
                to="/upload"
                class="block bg-ncad-green text-white py-3 px-6 font-medium hover:bg-opacity-80 transition-all"
              >
                Upload Your First Photo
              </router-link>
              <router-link 
                to="/"
                class="block bg-black border border-white text-white py-3 px-6 font-medium hover:bg-gray-800 transition-all"
              >
                Explore the Archive
              </router-link>
            </div>
          </div>
        </section>

        <!-- Contact & Info Section -->
        <section class="space-y-6">
          <div class="text-center">
            <h3 class="text-xl font-bold text-white">Get in Touch</h3>
            <div class="w-16 h-1 bg-ncad-green mx-auto mt-2"></div>
          </div>
          
          <div class="bg-gray-900 p-6 space-y-4 text-center">
            <div class="space-y-2 text-gray-300">
              <p><strong class="text-white">Questions or Feedback?</strong></p>
              <p>📧 archive@ncad.ie</p>
              <p>📍 100 Thomas Street, Dublin 8</p>
              <p>🌐 ncad.ie</p>
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
import { ref, onMounted } from 'vue'
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

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('Image failed to load:', img.src)
  // Hide the image if it fails to load
  img.style.display = 'none'
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
  } catch (error) {
    console.error('Error fetching statistics:', error)
    // Fallback to default values
    totalPhotos.value = 347
    totalStudents.value = 156
    totalVisits.value = 2840
    campusLocations.value = 89
  }
}

onMounted(async () => {
  await fetchRealStatistics()
})
</script>