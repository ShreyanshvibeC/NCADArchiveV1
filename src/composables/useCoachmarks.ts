import { ref } from 'vue'

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

const TUTORIAL_STEPS: CoachmarkStep[] = [
  // Home page - Upload CTA
  {
    id: 'upload-cta',
    title: 'Share Your Creativity',
    description: 'This is your gateway to sharing photos with the NCAD community. Tap the + button to upload photos from around campus.',
    action: 'Try tapping the + button',
    target: '.rainbow-button',
    position: 'left',
    offset: { x: -20, y: 0 },
    shape: 'circle',
    route: '/'
  },
  
  // Navigate to photo detail
  {
    id: 'photo-interaction-intro',
    title: 'Explore Photos',
    description: 'Let\'s explore how to interact with photos. We\'ll navigate to a photo to show you the features.',
    navigateTo: 'photo detail page',
    route: '/photo/demo', // This would be dynamically set to an actual photo
    delay: 1500
  },
  
  // Photo detail - Like button
  {
    id: 'like-photo',
    title: 'Show Appreciation',
    description: 'Double-tap the photo or use this heart button to like photos you enjoy. Your likes help creators know their work is appreciated.',
    action: 'Try double-tapping the photo or tap the heart',
    target: 'button:has(svg[stroke-width="1.5"])',
    position: 'top',
    offset: { x: 0, y: -10 }
  },
  
  // Photo detail - Swipe interaction
  {
    id: 'swipe-details',
    title: 'Swipe for Details',
    description: 'Swipe left on the photo to reveal the title and description. Swipe right to go back to the image.',
    action: 'Try swiping left on the photo',
    target: '.card-container',
    position: 'bottom',
    offset: { x: 0, y: 20 }
  },
  
  // Photo detail - Share button
  {
    id: 'share-photo',
    title: 'Share with Others',
    description: 'Share interesting photos with friends or on social media. The share feature includes the photo and a link back to NCAD Archive.',
    action: 'Tap to open share options',
    target: 'button:has(svg[stroke-width="1.5"]):has(path[d*="8.684"])',
    position: 'top',
    offset: { x: 0, y: -10 }
  },
  
  // Photo detail - Save button
  {
    id: 'save-photo',
    title: 'Save for Later',
    description: 'Bookmark photos to your saved collection. Perfect for keeping track of locations you want to visit or artwork that inspires you.',
    action: 'Tap the bookmark icon',
    target: 'button:has(svg[stroke-width="1.5"]):has(path[d*="M5 5a2"])',
    position: 'top',
    offset: { x: 0, y: -10 }
  },
  
  // Photo detail - Take Me There
  {
    id: 'location-feature',
    title: 'Visit the Location',
    description: 'When photos include location data, you can get directions to visit the exact spot where the photo was taken.',
    action: 'Tap to get directions',
    target: 'button:contains("TAKE ME THERE")',
    position: 'top',
    offset: { x: 0, y: -10 }
  },
  
  // Navigate to profile
  {
    id: 'profile-intro',
    title: 'Manage Your Profile',
    description: 'Now let\'s check out your profile where you can manage your photos and account settings.',
    navigateTo: 'profile page',
    route: '/profile',
    delay: 1500
  },
  
  // Profile - Edit profile
  {
    id: 'edit-profile',
    title: 'Customize Your Profile',
    description: 'Add a bio and update your name to let other NCAD students know more about you and your creative work.',
    action: 'Tap the edit icon',
    target: 'button:has(svg[viewBox="0 0 24 24"]):has(path[d*="M11 5H6"])',
    position: 'left',
    offset: { x: -10, y: 0 }
  },
  
  // Profile - Photo management
  {
    id: 'manage-photos',
    title: 'Manage Your Photos',
    description: 'View all your uploaded photos here. You can see how many visits and likes each photo has received. Tap any photo to view or delete it.',
    action: 'Tap on any photo to manage it',
    target: '.grid.grid-cols-2 > div:first-child',
    position: 'bottom',
    offset: { x: 0, y: 10 }
  },
  
  // Profile - Saved photos tab
  {
    id: 'saved-photos-tab',
    title: 'Your Saved Collection',
    description: 'Switch to the Saved tab to see all the photos you\'ve bookmarked. This is your personal collection of inspiring content.',
    action: 'Tap the Saved tab',
    target: 'button:contains("Saved")',
    position: 'bottom',
    offset: { x: 0, y: 10 }
  },
  
  // Final step
  {
    id: 'tutorial-complete',
    title: 'You\'re All Set!',
    description: 'You now know how to upload, interact with, and manage photos on NCAD Archive. Start exploring and sharing your creative journey!',
    target: '',
    position: 'bottom'
  }
]

export const useCoachmarks = () => {
  const isVisible = ref(false)
  const hasSeenTutorial = ref(false)

  const startTutorial = () => {
    isVisible.value = true
    hasSeenTutorial.value = false
  }

  const completeTutorial = () => {
    isVisible.value = false
    hasSeenTutorial.value = true
    localStorage.setItem('ncad-archive-tutorial-completed', 'true')
  }

  const skipTutorial = () => {
    isVisible.value = false
    hasSeenTutorial.value = true
    localStorage.setItem('ncad-archive-tutorial-skipped', 'true')
  }

  const checkTutorialStatus = () => {
    const completed = localStorage.getItem('ncad-archive-tutorial-completed')
    const skipped = localStorage.getItem('ncad-archive-tutorial-skipped')
    hasSeenTutorial.value = !!(completed || skipped)
  }

  const resetTutorial = () => {
    localStorage.removeItem('ncad-archive-tutorial-completed')
    localStorage.removeItem('ncad-archive-tutorial-skipped')
    hasSeenTutorial.value = false
  }

  return {
    isVisible,
    hasSeenTutorial,
    steps: TUTORIAL_STEPS,
    startTutorial,
    completeTutorial,
    skipTutorial,
    checkTutorialStatus,
    resetTutorial
  }
}