/**
 * Mobile performance tracking and optimization utilities
 */

import { isMobileDevice } from './mobileUtils'

export class MobilePerformanceTracker {
  private static slowConnectionDetected = false

  static trackImageLoad(imageUrl: string): void {
    if (!isMobileDevice()) return
    
    const startTime = performance.now()
    
    const img = new Image()
    img.onload = () => {
      const loadTime = performance.now() - startTime
      console.log(`Mobile image load: ${loadTime.toFixed(2)}ms`)
      
      // Adjust strategy if loading is slow
      if (loadTime > 2000) {
        this.slowConnectionDetected = true
        sessionStorage.setItem('mobile-slow-connection', 'true')
        console.warn('Slow mobile connection detected, switching to optimized mode')
      }
    }
    
    img.onerror = () => {
      console.warn('Mobile image load failed:', imageUrl)
    }
    
    img.src = imageUrl
  }

  static isSlowConnection(): boolean {
    return sessionStorage.getItem('mobile-slow-connection') === 'true' || this.slowConnectionDetected
  }

  static trackMemoryUsage(): void {
    if (!isMobileDevice() || !(performance as any).memory) return
    
    const memory = (performance as any).memory
    const memoryInfo = {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    }
    
    console.log('Mobile memory usage:', memoryInfo)
    
    // Warn if memory usage is high
    if (memoryInfo.used > memoryInfo.limit * 0.8) {
      console.warn('High mobile memory usage detected')
      this.triggerMemoryCleanup()
    }
  }

  static triggerMemoryCleanup(): void {
    if (!isMobileDevice()) return
    
    // Force garbage collection hint
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    // Clear mobile cache if memory is low
    const { MobileCacheManager } = require('./mobileCache')
    MobileCacheManager.clearOldCache()
    
    console.log('Mobile memory cleanup triggered')
  }

  static startPerformanceMonitoring(): void {
    if (!isMobileDevice()) return
    
    // Track memory usage every 30 seconds
    setInterval(() => {
      this.trackMemoryUsage()
    }, 30000)
    
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          console.log('Mobile page load time:', navigation.loadEventEnd - navigation.fetchStart, 'ms')
        }
      }, 0)
    })
  }

  static optimizeForSlowConnection(): boolean {
    return this.isSlowConnection()
  }
}