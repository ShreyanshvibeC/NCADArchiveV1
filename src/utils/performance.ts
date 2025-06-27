/**
 * Performance optimization utilities
 */

// Image optimization and WebP conversion
export const optimizeImage = async (
  file: File, 
  maxWidth: number = 1200, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const { width, height } = img
      const aspectRatio = width / height
      
      let newWidth = width
      let newHeight = height
      
      if (width > maxWidth) {
        newWidth = maxWidth
        newHeight = maxWidth / aspectRatio
      }
      
      canvas.width = newWidth
      canvas.height = newHeight
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Try WebP first, fallback to JPEG
      canvas.toBlob((webpBlob) => {
        if (webpBlob && webpBlob.size < file.size) {
          const optimizedFile = new File([webpBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now()
          })
          resolve(optimizedFile)
        } else {
          // Fallback to JPEG
          canvas.toBlob((jpegBlob) => {
            if (jpegBlob) {
              const optimizedFile = new File([jpegBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(optimizedFile)
            } else {
              resolve(file)
            }
          }, 'image/jpeg', quality)
        }
      }, 'image/webp', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Lazy loading intersection observer
export const createLazyLoader = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  })
}

// Debounce utility for search and input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Cache management
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttlMs: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}

export const cacheManager = new CacheManager()

// Bundle size optimization - dynamic imports
export const loadComponent = (componentPath: string) => {
  return () => import(componentPath)
}

// Performance monitoring
export const performanceMonitor = {
  startTiming: (label: string) => {
    performance.mark(`${label}-start`)
  },
  
  endTiming: (label: string) => {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const measure = performance.getEntriesByName(label)[0]
    console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`)
    
    return measure.duration
  },
  
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  }
}