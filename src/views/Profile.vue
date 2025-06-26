<template>
  <div class="min-h-screen bg-black p-4">
    <!-- Header -->
<header class="flex items-center justify-between bg-black py-4">
  <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
    </svg>
  </button>

  <h1 class="text-xl font-semibold text-white leading-none">Profile</h1>

  <button
    v-if="authStore.isAuthenticated"
    @click="handleLogout"
    class="p-2 text-gray-400 hover:text-white text-sm transition-colors"
  >
    Logout
  </button>
</header>


    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
      <!-- Loading State -->
      <div v-if="authStore.loading" class="flex justify-center items-center py-12">
        <div class="text-gray-400">Loading...</div>
      </div>

      <!-- Not Authenticated - Show Login Options -->
      <div v-else-if="!authStore.isAuthenticated" class="space-y-6">
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-bold">Welcome to NCAD Archive</h2>
          <p class="text-gray-400">
            Sign in to your account or create a new one to start sharing photos
          </p>
        </div>

        <div class="space-y-4">
          <router-link 
            to="/login"
            class="block w-full bg-ncad-green text-black py-3 font-medium hover:bg-opacity-80 transition-all text-center"
          >
            Sign In
          </router-link>
          
          <router-link 
            to="/signup"
            class="block w-full bg-gray-900 text-white py-3 font-medium hover:bg-gray-800 transition-all text-center border border-gray-600"
          >
            Create Account
          </router-link>
        </div>

        <div class="text-center">
          <p class="text-gray-400 text-sm">
            Join the NCAD community and start exploring campus through photos
          </p>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="space-y-8">
        <!-- Profile Info -->
        <div class="space-y-6">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-600 flex items-center justify-center">
              <span class="text-2xl font-bold">{{ userInitials }}</span>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-semibold">{{ authStore.user?.name }}</h2>
              <p class="text-gray-400">{{ authStore.user?.email }}</p>
              <p v-if="authStore.user?.bio" class="text-sm text-gray-400 mt-1">{{ authStore.user.bio }}</p>
            </div>
            <button @click="showEditProfile = true" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-900 p-4 text-center">
              <div class="text-2xl font-bold">{{ actualPhotoCount }}</div>
              <div class="text-sm text-gray-400">Photos</div>
            </div>
            <div class="bg-gray-900 p-4 text-center">
              <div class="text-2xl font-bold">{{ totalLikes }}</div>
              <div class="text-sm text-gray-400">Likes</div>
            </div>
            <div class="bg-gray-900 p-4 text-center">
              <div class="text-2xl font-bold">{{ totalVisits }}</div>
              <div class="text-sm text-gray-400">Total Visits</div>
            </div>
          </div>

          <!-- Upload Limit Warning -->
          <div v-if="actualPhotoCount >= 25" class="bg-ncad-green bg-opacity-20 border border-ncad-green p-4">
            <p class="text-ncad-green text-sm">
              You've reached the upload limit of 25 photos. Delete some photos to upload new ones.
            </p>
          </div>
        </div>

        <!-- Tab Navigation with Black Selected Tab -->
        <div class="flex space-x-1 bg-gray-900">
          <button 
            @click="activeTab = 'photos'"
            :class="{ 
              'bg-black text-white border border-gray-600': activeTab === 'photos', 
              'text-gray-400 hover:text-white': activeTab !== 'photos' 
            }"
            class="flex-1 py-3 px-4 font-medium transition-all"
          >
            Your Photos
          </button>
          <button 
            @click="activeTab = 'saved'"
            :class="{ 
              'bg-black text-white border border-gray-600': activeTab === 'saved', 
              'text-gray-400 hover:text-white': activeTab !== 'saved' 
            }"
            class="flex-1 py-3 px-4 font-medium transition-all"
          >
            Saved
          </button>
        </div>

        <!-- User's Photos Tab -->
        <div v-if="activeTab === 'photos'" class="space-y-4">
          <div v-if="loadingPhotos" class="text-center py-8 text-gray-400">
            <p>Loading your photos...</p>
          </div>
          
          <div v-else-if="userPhotos.length === 0" class="text-center py-12 text-gray-400">
            <p>No photos uploaded yet</p>
            <router-link 
              v-if="actualPhotoCount < 25"
              to="/upload" 
              class="inline-block mt-4 bg-ncad-green text-black px-6 py-2 font-medium hover:bg-opacity-80 transition-all"
            >
              Upload Your First Photo
            </router-link>
          </div>

          <div v-else class="grid grid-cols-2 gap-4">
            <div 
              v-for="photo in userPhotos" 
              :key="photo.id"
              class="relative cursor-pointer"
              @click="$router.push(`/photo/${photo.id}`)"
            >
              <img 
                :src="photo.imageURL" 
                :alt="photo.title || 'Photo'"
                class="w-full aspect-square object-cover"
              />
              <div class="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 px-2 py-1">
                <span class="text-xs">{{ photo.visits }} visits</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Photos Tab -->
        <div v-if="activeTab === 'saved'" class="space-y-4">
          <div v-if="loadingSavedPhotos" class="text-center py-8 text-gray-400">
            <p>Loading saved photos...</p>
          </div>
          
          <div v-else-if="savedPhotos.length === 0" class="text-center py-12 text-gray-400">
            <p>No saved photos yet</p>
            <p class="text-sm mt-2">Save photos by tapping the bookmark icon on any photo</p>
          </div>

          <div v-else class="grid grid-cols-2 gap-4">
            <div 
              v-for="photo in savedPhotos" 
              :key="photo.id"
              class="relative cursor-pointer"
              @click="$router.push(`/photo/${photo.id}`)"
            >
              <img 
                :src="photo.imageURL" 
                :alt="photo.title || 'Photo'"
                class="w-full aspect-square object-cover"
              />
              <div class="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 px-2 py-1">
                <span class="text-xs">{{ photo.visits }} visits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfile" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 p-4 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Edit Profile</h3>
        
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input 
              v-model="editName"
              type="text" 
              required
              class="w-full bg-gray-600 border border-gray-600 p-3 text-white focus:border-ncad-green focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Bio</label>
            <textarea 
              v-model="editBio"
              rows="3"
              class="w-full bg-gray-600 border border-gray-600 p-3 text-white focus:border-ncad-green focus:outline-none resize-none transition-colors"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <div class="flex space-x-3">
            <button 
              type="submit"
              :disabled="updatingProfile"
              class="flex-1 bg-ncad-green text-black py-2 font-medium hover:bg-opacity-80 transition-all disabled:opacity-50"
            >
              {{ updatingProfile ? 'Saving...' : 'Save' }}
            </button>
            <button 
              type="button"
              @click="cancelEdit"
              class="flex-1 bg-gray-600 text-white py-2 font-medium hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGalleryStore } from '../stores/gallery'

const authStore = useAuthStore()
const galleryStore = useGalleryStore()

const userPhotos = ref([])
const savedPhotos = ref([])
const loadingPhotos = ref(false)
const loadingSavedPhotos = ref(false)
const totalVisits = ref(0)
const totalLikes = ref(0)
const activeTab = ref('photos')

const showEditProfile = ref(false)
const editName = ref('')
const editBio = ref('')
const updatingProfile = ref(false)

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
  return authStore.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// Computed property for actual photo count from loaded photos
const actualPhotoCount = computed(() => {
  return userPhotos.value.length
})

onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user) {
    await loadUserPhotos()
  }
})

// Watch for tab changes
watch(activeTab, async (newTab) => {
  if (newTab === 'saved' && authStore.isAuthenticated && authStore.user && savedPhotos.value.length === 0) {
    await loadSavedPhotos()
  }
})

// Watch for changes in actual photo count and sync with auth store
watch(actualPhotoCount, async (newCount) => {
  if (authStore.user && authStore.user.uploadCount !== newCount) {
    console.log(`Photo count mismatch detected. Auth store: ${authStore.user.uploadCount}, Actual: ${newCount}`)
    await authStore.syncUploadCount(newCount)
  }
})

const loadUserPhotos = async () => {
  if (!authStore.user) return
  
  loadingPhotos.value = true
  try {
    userPhotos.value = await galleryStore.loadUserPhotos(authStore.user.id)
    totalVisits.value = userPhotos.value.reduce((total, photo) => total + photo.visits, 0)
    totalLikes.value = userPhotos.value.reduce((total, photo) => total + (photo.likes || 0), 0)
    
    // Sync the upload count with actual photo count
    await authStore.syncUploadCount(userPhotos.value.length)
  } catch (error) {
    console.error('Error loading user photos:', error)
  } finally {
    loadingPhotos.value = false
  }
}

const loadSavedPhotos = async () => {
  if (!authStore.user) return
  
  loadingSavedPhotos.value = true
  try {
    savedPhotos.value = await galleryStore.loadSavedPhotos(authStore.user.id)
  } catch (error) {
    console.error('Error loading saved photos:', error)
  } finally {
    loadingSavedPhotos.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  userPhotos.value = []
  savedPhotos.value = []
  totalVisits.value = 0
  totalLikes.value = 0
  activeTab.value = 'photos'
}

const updateProfile = async () => {
  updatingProfile.value = true
  
  try {
    const result = await authStore.updateProfile({
      name: editName.value,
      bio: editBio.value
    })
    
    if (result.success) {
      showEditProfile.value = false
    }
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    updatingProfile.value = false
  }
}

const cancelEdit = () => {
  showEditProfile.value = false
  editName.value = authStore.user?.name || ''
  editBio.value = authStore.user?.bio || ''
}

// Initialize edit form when showing
watch(showEditProfile, (show) => {
  if (show) {
    editName.value = authStore.user?.name || ''
    editBio.value = authStore.user?.bio || ''
  }
})
</script>