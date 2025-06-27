/**
 * Comprehensive error handling and retry mechanisms
 */

export interface RetryOptions {
  maxAttempts: number
  delay: number
  backoff: boolean
}

// Retry mechanism with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options
  
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
      console.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`, error)
      
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError!
}

// Error boundary for Vue components
export const createErrorHandler = (componentName: string) => {
  return (error: Error, instance: any, info: string) => {
    console.error(`Error in ${componentName}:`, error)
    console.error('Component instance:', instance)
    console.error('Error info:', info)
    
    // Send to error reporting service in production
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error)
    }
  }
}

// Network error handling
export const handleNetworkError = (error: any): string => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.'
  }
  
  if (error.code === 'auth/network-request-failed') {
    return 'Network error. Please check your connection and try again.'
  }
  
  if (error.code === 'storage/retry-limit-exceeded') {
    return 'Upload failed after multiple attempts. Please try again later.'
  }
  
  if (error.code === 'firestore/unavailable') {
    return 'Service temporarily unavailable. Please try again in a moment.'
  }
  
  return error.message || 'An unexpected error occurred'
}

// Offline detection and handling
export class OfflineManager {
  private isOnline = navigator.onLine
  private listeners: ((online: boolean) => void)[] = []
  
  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners()
    })
  }
  
  getStatus(): boolean {
    return this.isOnline
  }
  
  onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline))
  }
}

export const offlineManager = new OfflineManager()