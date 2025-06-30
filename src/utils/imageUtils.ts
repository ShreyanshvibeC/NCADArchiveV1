// Image compression with better quality and performance
export const compressImage = (file: File, targetSize = 800, quality = 0.85): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      const { width, height } = img
      
      // Calculate dimensions for center square crop
      const minDimension = Math.min(width, height)
      const srcX = (width - minDimension) / 2
      const srcY = (height - minDimension) / 2
      
      // Set canvas to square dimensions
      canvas.width = targetSize
      canvas.height = targetSize
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw the center square crop, scaled to target size
      ctx.drawImage(
        img,
        srcX, srcY, minDimension, minDimension, // Source: center square from original
        0, 0, targetSize, targetSize // Destination: full canvas
      )
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          resolve(file)
        }
      }, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Optimized geolocation with better error handling and timeout
export const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    
    // Use a shorter timeout for better UX
    const timeoutId = setTimeout(() => {
      console.warn('Geolocation timeout')
      resolve(null)
    }, 8000) // 8 seconds instead of 10
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        clearTimeout(timeoutId)
        console.warn('Geolocation error:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 7000, // 7 seconds
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Image preloading utility for better performance
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // Resolve even on error to not block other images
        img.src = url
      })
    )
  )
}

// Intersection Observer for lazy loading
export const createImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px', // Start loading 50px before entering viewport
    threshold: 0.1
  })
}