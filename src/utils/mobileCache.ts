/**
 * Mobile-specific caching utilities
 */

import { isMobileDevice } from './mobileUtils'

export class MobileCacheManager {
  private static readonly MOBILE_CACHE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly MOBILE_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
  private static readonly CACHE_PREFIX = 'mobile-img-'

  static cacheImage(url: string, blob: Blob): void {
    if (!isMobileDevice()) return
    
    try {
      const cacheKey = `${this.CACHE_PREFIX}${btoa(url).slice(0, 20)}`
      const cacheData = {
        blob: Array.from(new Uint8Array(blob as any)), // Convert blob to array for storage
        timestamp: Date.now(),
        size: blob.size,
        type: blob.type
      }
      
      // Check cache size before storing
      if (this.getCurrentCacheSize() + blob.size < this.MOBILE_CACHE_SIZE) {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      } else {
        this.clearOldCache()
        // Try again after clearing
        if (this.getCurrentCacheSize() + blob.size < this.MOBILE_CACHE_SIZE) {
          localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        }
      }
    } catch (error) {
      console.warn('Mobile cache storage failed:', error)
      // Handle quota exceeded
      this.clearOldCache()
    }
  }

  static getCachedImage(url: string): Blob | null {
    if (!isMobileDevice()) return null
    
    try {
      const cacheKey = `${this.CACHE_PREFIX}${btoa(url).slice(0, 20)}`
      const cached = localStorage.getItem(cacheKey)
      
      if (!cached) return null
      
      const cacheData = JSON.parse(cached)
      
      // Check if cache is still valid
      if (Date.now() - cacheData.timestamp > this.MOBILE_CACHE_DURATION) {
        localStorage.removeItem(cacheKey)
        return null
      }
      
      // Convert array back to blob
      const uint8Array = new Uint8Array(cacheData.blob)
      return new Blob([uint8Array], { type: cacheData.type })
    } catch (error) {
      console.warn('Mobile cache retrieval failed:', error)
      return null
    }
  }

  static getCurrentCacheSize(): number {
    let totalSize = 0
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX))
    
    keys.forEach(key => {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          const cacheData = JSON.parse(cached)
          totalSize += cacheData.size || 0
        }
      } catch (error) {
        // Remove corrupted cache entries
        localStorage.removeItem(key)
      }
    })
    
    return totalSize
  }

  static clearOldCache(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX))
    const now = Date.now()
    
    keys.forEach(key => {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          const cacheData = JSON.parse(cached)
          if (now - cacheData.timestamp > this.MOBILE_CACHE_DURATION) {
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key)
      }
    })
  }

  static clearAllCache(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX))
    keys.forEach(key => localStorage.removeItem(key))
  }

  static getCacheStats(): { size: number; entries: number } {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX))
    return {
      size: this.getCurrentCacheSize(),
      entries: keys.length
    }
  }
}