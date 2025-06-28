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
      
      // Draw the center square crop, scaled to target size
      ctx.drawImage(
        img,
        srcX, srcY, minDimension, minDimension, // Source: center square from original
        0, 0, targetSize, targetSize // Destination: full canvas
      )
      
      // Use WebP format if supported, otherwise JPEG
      const outputFormat = 'image/webp'
      const fallbackFormat = 'image/jpeg'
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: outputFormat,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        } else {
          // Fallback to JPEG if WebP fails
          canvas.toBlob((fallbackBlob) => {
            if (fallbackBlob) {
              const compressedFile = new File([fallbackBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: fallbackFormat,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          }, fallbackFormat, quality)
        }
      }, outputFormat, quality)
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

// Progressive image loading utility
export const createProgressiveImage = (src: string, placeholder?: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve(img)
    img.onerror = reject
    
    // Set placeholder first if provided
    if (placeholder) {
      img.src = placeholder
    }
    
    // Then load the actual image
    img.src = src
  })
}

// Image intersection observer for lazy loading
export const createImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }
  
  return new IntersectionObserver((entries) => {
    entries.forEach(callback)
  }, options)
}