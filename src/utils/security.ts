/**
 * Security utilities for input validation and sanitization
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@ncad\.ie$/,
  name: /^[a-zA-Z\s'-]{1,50}$/,
  title: /^[a-zA-Z0-9\s\-_.,!?'"()]{1,100}$/,
  description: /^[a-zA-Z0-9\s\-_.,!?'"()]{1,200}$/
}

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 500) // Limit length
}

// Validate file uploads
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' }
  }
  
  // Check dimensions (basic validation)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        resolve({ valid: false, error: 'Image must be at least 100x100 pixels' })
      } else if (img.width > 4000 || img.height > 4000) {
        resolve({ valid: false, error: 'Image must be smaller than 4000x4000 pixels' })
      } else {
        resolve({ valid: true })
      }
    }
    img.onerror = () => {
      resolve({ valid: false, error: 'Invalid image file' })
    }
    img.src = URL.createObjectURL(file)
  })
}

// Rate limiting for uploads
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  isAllowed(userId: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(userId) || []
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs)
    
    if (recentAttempts.length >= maxAttempts) {
      return false
    }
    
    // Add current attempt
    recentAttempts.push(now)
    this.attempts.set(userId, recentAttempts)
    
    return true
  }
  
  getRemainingTime(userId: string, windowMs: number = 60000): number {
    const userAttempts = this.attempts.get(userId) || []
    if (userAttempts.length === 0) return 0
    
    const oldestAttempt = Math.min(...userAttempts)
    const timeLeft = windowMs - (Date.now() - oldestAttempt)
    
    return Math.max(0, timeLeft)
  }
}

export const uploadRateLimiter = new RateLimiter()

// Content Security Policy helper
export const getCSPDirectives = () => {
  return {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' https://www.gstatic.com",
    'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    'img-src': "'self' data: https: blob:",
    'font-src': "'self' https://fonts.gstatic.com",
    'connect-src': "'self' https://*.firebaseapp.com https://*.googleapis.com",
    'frame-src': "'none'",
    'object-src': "'none'",
    'base-uri': "'self'"
  }
}