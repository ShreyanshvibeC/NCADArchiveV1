<template>
  <div class="min-h-screen bg-black p-4">
    <!-- Header -->
<header class="flex items-center justify-between bg-black py-4">
  <button @click="$router.back()" class="p-2 text-white hover:text-gray-400 transition-colors">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
    </svg>
  </button>

  <h1 class="text-xl font-semibold text-white leading-none">{{ isOwnProfile ? 'Profile' : `${profileUser?.name || 'User'}'s Profile` }}</h1>

  <button
    v-if="authStore.isAuthenticated && isOwnProfile"
    @click="handleLogout"
    class="p-2 text-gray-400 hover:text-white text-sm transition-colors"
  >
    Logout
  </button>
  <div v-else class="w-6"></div>
</header>


    <!-- Main Content Container with Desktop Margins -->
    <div class="max-w-md mx-auto lg:max-w-lg xl:max-w-xl pt-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-gray-400">Loading...</div>
      </div>

      <!-- Not Authenticated and viewing own profile - Show Login Options -->
      <div v-else-if="!authStore.isAuthenticated && isOwnProfile" class="space-y-6">
        <div class="text-center space-y-4">
          <h2 class="text-2xl font-bold">Welcome to NCAD Archive</h2>
          <p class="text-gray-400">
            Sign in to your account or create a new one to start sharing
          </p>
        </div>

        <div class="space-y-4">
          <router-link 
            to="/login"
            class="block w-full bg-ncad-yellow text-black py-3 font-medium hover:bg-opacity-80 transition-all text-center"
          >
            Sign In
          </router-link>
          
          <router-link 
            to="/signup"
            class="block w-full bg-black text-white py-3 font-medium hover:bg-gray-800 transition-all text-center border border-gray-600"
          >
            Create Account
          </router-link>
        </div>

        <div class="text-center">
          <p class="text-gray-400 text-sm">
            Join the NCAD community and start exploring the campus
          </p>
        </div>
      </div>

      <!-- User not found -->
      <div v-else-if="!profileUser" class="text-center py-12">
        <p class="text-gray-400">User not found</p>
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
              <h2 class="text-xl font-semibold">{{ profileUser.name }}</h2>
              <p class="text-gray-400">{{ profileUser.email }}</p>
              <p v-if="profileUser.bio" class="text-sm text-gray-400 mt-1">{{ profileUser.bio }}</p>
            </div>
            <button 
              v-if="isOwnProfile"
              @click="showEditProfile = true" 
              class="text-gray-400 hover:text-white transition-colors"
            >
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

          <!-- Upload Limit Warning - Only show for own profile -->
          <div v-if="isOwnProfile && actualPhotoCount >= 25" class="bg-ncad-yellow bg-opacity-20 border border-ncad-yellow p-4">
            <p class="text-ncad-yellow text-sm">
              You've reached the upload limit of 25 photos. Delete some photos to upload new ones.
            </p>
          </div>
        </div>

        <!-- Tab Navigation - Only show for own profile -->
        <div v-if="isOwnProfile" class="flex space-x-1 bg-gray-900">
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
        <div v-if="isOwnProfile && activeTab === 'photos'" class="space-y-4">
          <div v-if="loadingPhotos" class="text-center py-8 text-gray-400">
            <p>Loading your photos...</p>
          </div>
          
          <div v-else-if="userPhotos.length === 0" class="text-center py-12 text-gray-400">
            <p>No photos uploaded yet</p>
            <router-link 
              v-if="actualPhotoCount < 25"
              to="/upload" 
              class="inline-block mt-4 bg-ncad-yellow text-black px-6 py-2 font-medium hover:bg-opacity-80 transition-all"
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
        <div v-if="isOwnProfile && activeTab === 'saved'" class="space-y-4">
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

        <!-- Other User's Photos (when viewing someone else's profile) -->
        <div v-if="!isOwnProfile" class="space-y-4">
          <h3 class="text-lg font-semibold">Photos by {{ profileUser.name }}</h3>
          
          <div v-if="loadingPhotos" class="text-center py-8 text-gray-400">
            <p>Loading photos...</p>
          </div>
          
          <div v-else-if="userPhotos.length === 0" class="text-center py-12 text-gray-400">
            <p>No photos uploaded yet</p>
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
      </div>
    </div>

    <!-- Edit Profile Modal - Only show for own profile -->
    <div v-if="showEditProfile && isOwnProfile" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 p-4 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Edit Profile</h3>
        
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Name</label>
            <input 
              v-model="editName"
              type="text" 
              required
              class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Bio</label>
            <textarea 
              v-model="editBio"
              rows="3"
              class="w-full bg-black border border-gray-600 p-3 text-white focus:border-white focus:outline-none resize-none transition-colors"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <div class="flex space-x-3">
            <button 
              type="submit"
              :disabled="updatingProfile"
              class="flex-1 bg-ncad-yellow text-black py-2 font-medium hover:bg-opacity-80 transition-all disabled:opacity-50"
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
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useGalleryStore } from '../stores/gallery'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const route = useRoute()
const authStore = useAuthStore()
const galleryStore = useGalleryStore()

const userPhotos = ref([])
const savedPhotos = ref([])
const loadingPhotos = ref(false)
const loadingSavedPhotos = ref(false)
const totalVisits = ref(0)
const totalLikes = ref(0)
const activeTab = ref('photos')
const loading = ref(true)
const profileUser = ref(null)

const showEditProfile = ref(false)
const editName = ref('')
const editBio = ref('')
const updatingProfile = ref(false)

// Check if viewing own profile or another user's profile
const isOwnProfile = computed(() => {
  return !route.params.id || (authStore.user && route.params.id === authStore.user.id)
})

const userInitials = computed(() => {
  if (!profileUser.value?.name) return 'U'
  return profileUser.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// Computed property for actual photo count from loaded photos
const actualPhotoCount = computed(() => {
  return userPhotos.value.length
})

onMounted(async () => {
  await loadProfileData()
})

// Watch for route changes (when navigating between different user profiles)
watch(() => route.params.id, async () => {
  await loadProfileData()
})

const loadProfileData = async () => {
  loading.value = true
  
  try {
    if (isOwnProfile.value) {
      // Loading own profile
      if (authStore.isAuthenticated && authStore.user) {
        profileUser.value = authStore.user
        await loadUserPhotos()
      }
    } else {
      // Loading another user's profile
      const userId = route.params.id as string
      await loadOtherUserProfile(userId)
      await loadUserPhotos(userId)
    }
  } catch (error) {
    console.error('Error loading profile data:', error)
  } finally {
    loading.value = false
  }
}

const loadOtherUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      profileUser.value = {
        id: userId,
        email: userData.email,
        name: userData.name,
        bio: userData.bio,
        uploadCount: userData.uploadCount || 0,
        createdAt: userData.createdAt?.toDate() || new Date()
      }
    } else {
      profileUser.value = null
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    profileUser.value = null
  }
}

// Watch for tab changes
watch(activeTab, async (newTab) => {
  if (newTab === 'saved' && authStore.isAuthenticated && authStore.user && savedPhotos.value.length === 0 && isOwnProfile.value) {
    await loadSavedPhotos()
  }
})

// Watch for changes in actual photo count and sync with auth store (only for own profile)
watch(actualPhotoCount, async (newCount) => {
  if (isOwnProfile.value && authStore.user && authStore.user.uploadCount !== newCount) {
    console.log(`Photo count mismatch detected. Auth store: ${authStore.user.uploadCount}, Actual: ${newCount}`)
    await authStore.syncUploadCount(newCount)
  }
})

const loadUserPhotos = async (userId?: string) => {
  const targetUserId = userId || (authStore.user?.id)
  if (!targetUserId) return
  
  loadingPhotos.value = true
  try {
    userPhotos.value = await galleryStore.loadUserPhotos(targetUserId)
    totalVisits.value = userPhotos.value.reduce((total, photo) => total + photo.visits, 0)
    totalLikes.value = userPhotos.value.reduce((total, photo) => total + (photo.likes || 0), 0)
    
    // Sync the upload count with actual photo count (only for own profile)
    if (isOwnProfile.value && authStore.user) {
      await authStore.syncUploadCount(userPhotos.value.length)
    }
  } catch (error) {
    console.error('Error loading user photos:', error)
  } finally {
    loadingPhotos.value = false
  }
}

const loadSavedPhotos = async () => {
  if (!authStore.user || !isOwnProfile.value) return
  
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
      // Update local profile data
      if (profileUser.value) {
        profileUser.value.name = editName.value
        profileUser.value.bio = editBio.value
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    updatingProfile.value = false
  }
}

const cancelEdit = () => {
  showEditProfile.value = false
  editName.value = profileUser.value?.name || ''
  editBio.value = profileUser.value?.bio || ''
}

// Initialize edit form when showing
watch(showEditProfile, (show) => {
  if (show) {
    editName.value = profileUser.value?.name || ''
    editBio.value = profileUser.value?.bio || ''
  }
})
</script>