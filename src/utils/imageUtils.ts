/**
 * Enhanced image compression with multiple quality levels and better optimization
 */

export const compressImage = (file: File, targetSize = 400, quality = 0.6): Promise<File> => {
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
      
      // Set canvas to target size (much smaller than before)
      canvas.width = targetSize
      canvas.height = targetSize
      
      // Enable image smoothing for better quality at smaller sizes
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw the center square crop, scaled to target size
      ctx.drawImage(
        img,
        srcX, srcY, minDimension, minDimension, // Source: center square from original
        0, 0, targetSize, targetSize // Destination: full canvas
      )
      
      // Use lower quality for much smaller file sizes
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          
          console.log(`🗜️ Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`)
          resolve(compressedFile)
        } else {
          resolve(file)
        }
      }, 'image/jpeg', quality) // Reduced from 0.8 to 0.6 for smaller files
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create thumbnail for feed display (even smaller)
 */
export const createThumbnail = (file: File): Promise<File> => {
  return compressImage(file, 300, 0.5) // Very small for feed
}

/**
 * Create full-size version for detail view
 */
export const createFullSize = (file: File): Promise<File> => {
  return compressImage(file, 800, 0.7) // Larger for detail view
}

export const getCurrentLocation = (): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}