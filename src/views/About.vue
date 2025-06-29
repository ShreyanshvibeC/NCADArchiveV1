<template>
  <div class="min-h-screen bg-black overflow-x-hidden">
    <!-- Header -->
    <header class="flex items-center justify-between bg-black py-4">
      <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <h1 class="text-xl font-semibold text-white leading-none">About</h1>

      <div class="w-6"></div>
    </header>

    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl px-4 pt-8">
      <div class="space-y-8">
        <!-- Hero Section -->
        <section class="text-center space-y-4">
          <h2 class="text-3xl font-bold">NCAD Archive</h2>
          <p class="text-gray-400 text-lg">
            Documenting campus life through student photography
          </p>
        </section>

        <!-- About Section -->
        <section class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3">Our Mission</h3>
            <p class="text-gray-300 leading-relaxed">
              The NCAD Archive is a collaborative platform where students capture and share the vibrant life of our campus. From everyday moments to special events, we're building a visual history of the National College of Art and Design.
            </p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">How It Works</h3>
            <div class="space-y-3 text-gray-300">
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-ncad-yellow flex items-center justify-center text-black font-bold text-sm mt-0.5">1</div>
                <p>Students upload photos from around campus with location data</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-ncad-yellow flex items-center justify-center text-black font-bold text-sm mt-0.5">2</div>
                <p>Photos are shared with the NCAD community for everyone to explore</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-ncad-yellow flex items-center justify-center text-black font-bold text-sm mt-0.5">3</div>
                <p>Interactive map shows where photos were taken around campus</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">Community Guidelines</h3>
            <div class="space-y-2 text-gray-300">
              <p>• Respect privacy - only photograph public spaces and willing participants</p>
              <p>• Keep content appropriate and relevant to campus life</p>
              <p>• Each student can upload up to 25 photos to maintain quality</p>
              <p>• Be creative and capture the unique spirit of NCAD</p>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3">NCAD Community Access</h3>
            <div class="bg-ncad-yellow bg-opacity-20 border border-ncad-yellow p-4">
              <p class="text-ncad-yellow text-sm">
                This platform is exclusively for NCAD students and staff. Only accounts with .ncad.ie email addresses can access the archive.
              </p>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="bg-gray-900 p-4 space-y-4">
          <h3 class="text-xl font-semibold text-center">Archive Statistics</h3>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-ncad-yellow">{{ totalPhotos }}</div>
              <div class="text-sm text-gray-400">Photos Shared</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-ncad-yellow">{{ totalStudents }}</div>
              <div class="text-sm text-gray-400">Contributing Students</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-ncad-yellow">{{ totalVisits }}</div>
              <div class="text-sm text-gray-400">Photo Views</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-ncad-yellow">{{ campusLocations }}</div>
              <div class="text-sm text-gray-400">Campus Locations</div>
            </div>
          </div>
        </section>

        <!-- Contact Section -->
        <section class="space-y-4">
          <h3 class="text-xl font-semibold">Get Involved</h3>
          <div class="space-y-3 text-gray-300">
            <p>
              Want to contribute to the NCAD Archive? Create an account with your NCAD email and start sharing your perspective of campus life.
            </p>
            <div class="space-y-2">
              <p><strong>Contact:</strong> archive@ncad.ie</p>
              <p><strong>Location:</strong> 100 Thomas Street, Dublin 8</p>
              <p><strong>Website:</strong> ncad.ie</p>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="text-center text-gray-500 text-sm pt-8 border-t border-gray-600">
          <p>&copy; 2024 National College of Art and Design</p>
          <p>Building a visual history of our campus community</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '../stores/gallery'

const galleryStore = useGalleryStore()

// Dummy statistics - in a real app these would come from the database
const totalPhotos = ref(247)
const totalStudents = ref(89)
const totalVisits = ref(1543)
const campusLocations = ref(23)

onMounted(async () => {
  // Load actual photo count if available
  try {
    await galleryStore.loadPhotos()
    totalPhotos.value = galleryStore.photos.length || 247
  } catch (error) {
    console.log('Using dummy data for statistics')
  }
})
</script>