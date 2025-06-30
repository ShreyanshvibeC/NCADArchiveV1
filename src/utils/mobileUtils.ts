/**
 * Mobile-specific utilities and optimizations
 */

export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isMobileDataConnection = (): boolean => {
  const connection = (navigator as any).connection
  if (connection) {
    return connection.effectiveType === '3g' || 
           connection.effectiveType === '2g' ||
           connection.saveData === true
  }
  return false
}

export const isMobileDataSaver = (): boolean => {
  const connection = (navigator as any).connection
  return connection?.saveData === true || 
         connection?.effectiveType === '2g' ||
         connection?.effectiveType === 'slow-2g'
}

export const getMobileLoadingStrategy = () => {
  if (isMobileDataConnection()) {
    return {
      photosPerPage: 5, // Load fewer photos
      imageQuality: 0.5, // Lower quality
      preloadCount: 1    // Preload only 1 image
    }
  }
  return {
    photosPerPage: 8,
    imageQuality: 0.7,
    preloadCount: 3
  }
}

export const getMobileOptimizedImageUrl = (originalUrl: string): string => {
  if (!isMobileDevice()) return originalUrl
  
  try {
    const url = new URL(originalUrl)
    // Add mobile-specific parameters for Firebase Storage
    url.searchParams.set('w', '400')
    url.searchParams.set('h', '400')
    url.searchParams.set('q', '65')
    return url.toString()
  } catch {
    return originalUrl
  }
}

export const optimizeMobilePerformance = () => {
  // Disable hover effects on mobile (they cause performance issues)
  if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device')
  }
  
  // Optimize touch events
  document.addEventListener('touchstart', () => {}, { passive: true })
  document.addEventListener('touchmove', () => {}, { passive: true })
  document.addEventListener('touchend', () => {}, { passive: true })
}

export const optimizeMobileBattery = () => {
  if (!isMobileDevice()) return
  
  // Reduce animation frame rate on mobile
  let lastFrame = 0
  const mobileRAF = (callback: FrameRequestCallback) => {
    const now = Date.now()
    if (now - lastFrame >= 33) { // ~30fps instead of 60fps
      lastFrame = now
      requestAnimationFrame(callback)
    } else {
      setTimeout(() => mobileRAF(callback), 16)
    }
  }
  
  // Replace requestAnimationFrame for animations on mobile
  if (isMobileDevice()) {
    (window as any).originalRAF = window.requestAnimationFrame
    window.requestAnimationFrame = mobileRAF
  }
}

export const createMobileIntersectionObserver = (callback: IntersectionObserverCallback) => {
  const options = {
    root: null,
    rootMargin: isMobileDevice() ? '50px' : '100px', // Smaller margin on mobile
    threshold: 0.1
  }
  
  return new IntersectionObserver(callback, options)
}

export const addMobileBackgroundOptimization = (galleryStore: any) => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isMobileDevice()) {
      // Pause non-critical operations when app is backgrounded
      if (galleryStore.pauseLoading) {
        galleryStore.pauseLoading()
      }
    } else if (!document.hidden && isMobileDevice()) {
      // Resume operations when app is foregrounded
      if (galleryStore.resumeLoading) {
        galleryStore.resumeLoading()
      }
    }
  })
}