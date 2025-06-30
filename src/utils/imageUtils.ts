import { isMobileDevice, isMobileDataSaver } from './mobileUtils'

export const compressImage = (file: File, targetSize?: number, quality?: number): Promise<File> => {
  return new Promise((resolve) => {
    // Mobile-optimized compression settings
    const mobileSettings = {
      targetSize: isMobileDevice() ? 400 : 800,
      quality: isMobileDataSaver() ? 0.5 : (isMobileDevice() ? 0.65 : 0.8)
    }
    
    const finalTargetSize = targetSize || mobileSettings.targetSize
    const finalQuality = quality || mobileSettings.quality
    
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
      canvas.width = finalTargetSize
      canvas.height = finalTargetSize
      
      // Draw the center square crop, scaled to target size
      ctx.drawImage(
        img,
        srcX, srcY, minDimension, minDimension, // Source: center square from original
        0, 0, finalTargetSize, finalTargetSize // Destination: full canvas
      )
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          
          console.log(`Image compressed: ${file.size} -> ${compressedFile.size} bytes (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`)
          resolve(compressedFile)
        } else {
          resolve(file)
        }
      }, 'image/jpeg', finalQuality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

export const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    
    // Mobile-optimized geolocation settings
    const options = {
      enableHighAccuracy: !isMobileDataSaver(), // Disable high accuracy on slow connections
      timeout: isMobileDevice() ? 15000 : 10000, // Longer timeout on mobile
      maximumAge: 300000 // 5 minutes
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.warn('Geolocation error:', error)
        resolve(null)
      },
      options
    )
  })
}

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      // Track mobile image load performance
      if (isMobileDevice()) {
        const { MobilePerformanceTracker } = require('./mobilePerformance')
        MobilePerformanceTracker.trackImageLoad(src)
      }
      resolve()
    }
    
    img.onerror = () => {
      console.warn(`Failed to preload image: ${src}`)
      resolve() // Resolve instead of reject to allow Promise.all to continue
    }
    
    img.src = src
  })
}