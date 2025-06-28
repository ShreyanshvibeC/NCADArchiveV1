/**
 * Native mobile share utilities
 * Handles sharing images with metadata across different platforms
 */

export interface ShareData {
  title: string
  description: string
  imageUrl: string
  pageUrl: string
}

/**
 * Creates a thumbnail from an image URL
 * @param imageUrl - Original image URL
 * @param maxSize - Maximum width/height for thumbnail (default: 300px)
 * @returns Promise<Blob> - Thumbnail image blob
 */
export const createThumbnail = async (imageUrl: string, maxSize: number = 300): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.crossOrigin = 'anonymous' // Handle CORS for Firebase Storage images
    
    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create thumbnail'))
          }
        },
        'image/jpeg',
        0.8 // 80% quality for good balance of size/quality
      )
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail creation'))
    }
    
    img.src = imageUrl
  })
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Prepares share data with proper formatting and validation
 * @param data - Raw share data
 * @returns Formatted share data
 */
export const prepareShareData = (data: ShareData) => {
  return {
    title: truncateText(data.title || 'NCAD Archive Photo', 100),
    description: truncateText(data.description || 'Check out this photo from NCAD Archive', 250),
    imageUrl: data.imageUrl,
    pageUrl: data.pageUrl
  }
}

/**
 * Checks if native sharing is supported
 * @returns boolean
 */
export const isNativeShareSupported = (): boolean => {
  return 'share' in navigator && 'canShare' in navigator
}

/**
 * Checks if the device can share files
 * @returns boolean
 */
export const canShareFiles = (): boolean => {
  return 'share' in navigator && 'canShare' in navigator && navigator.canShare({ files: [] })
}

/**
 * Shares content using native share API with image attachment
 * @param shareData - Data to share
 * @returns Promise<boolean> - Success status
 */
export const shareWithNativeAPI = async (shareData: ShareData): Promise<boolean> => {
  try {
    const formattedData = prepareShareData(shareData)
    
    // Create thumbnail
    console.log('Creating thumbnail for sharing...')
    const thumbnailBlob = await createThumbnail(formattedData.imageUrl)
    
    // Create file from blob
    const thumbnailFile = new File(
      [thumbnailBlob], 
      'ncad-archive-photo.jpg', 
      { type: 'image/jpeg' }
    )
    
    // Prepare share payload
    const sharePayload: any = {
      title: formattedData.title,
      text: `${formattedData.description}\n\n${formattedData.pageUrl}`,
      files: [thumbnailFile]
    }
    
    // Check if the payload can be shared
    if (navigator.canShare && !navigator.canShare(sharePayload)) {
      console.warn('Share payload not supported, falling back to text-only share')
      // Fallback to text-only share
      sharePayload.files = undefined
    }
    
    console.log('Sharing with native API:', sharePayload)
    await navigator.share(sharePayload)
    
    return true
  } catch (error: any) {
    console.error('Native share failed:', error)
    
    // If user cancelled, don't treat as error
    if (error.name === 'AbortError') {
      console.log('Share cancelled by user')
      return false
    }
    
    throw error
  }
}

/**
 * Fallback share methods for when native sharing isn't available
 */
export const fallbackShare = {
  /**
   * Copy link to clipboard
   */
  copyLink: async (url: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  },
  
  /**
   * Share via WhatsApp
   */
  whatsapp: (title: string, description: string, url: string) => {
    const text = encodeURIComponent(`${title}\n\n${description}\n\n${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  },
  
  /**
   * Share via Twitter
   */
  twitter: (title: string, description: string, url: string) => {
    const text = encodeURIComponent(`${title}\n\n${description}`)
    const shareUrl = encodeURIComponent(url)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank')
  },
  
  /**
   * Share via Facebook
   */
  facebook: (url: string) => {
    const shareUrl = encodeURIComponent(url)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank')
  },
  
  /**
   * Share via Email
   */
  email: (title: string, description: string, url: string) => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${description}\n\nView photo: ${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }
}

/**
 * Main share function that handles both native and fallback sharing
 * @param shareData - Data to share
 * @param showFallbackOptions - Whether to show fallback options if native sharing fails
 * @returns Promise<boolean> - Success status
 */
export const sharePhoto = async (
  shareData: ShareData, 
  showFallbackOptions: boolean = true
): Promise<boolean> => {
  // Check if native sharing is supported
  if (isNativeShareSupported()) {
    try {
      return await shareWithNativeAPI(shareData)
    } catch (error) {
      console.error('Native sharing failed, showing fallback options:', error)
      
      if (showFallbackOptions) {
        // Return false to indicate fallback should be shown
        return false
      }
      
      throw error
    }
  }
  
  // If native sharing not supported, return false to show fallback options
  return false
}

/**
 * Gets appropriate share button text based on platform
 * @returns string
 */
export const getShareButtonText = (): string => {
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return 'Share'
  } else if (userAgent.includes('android')) {
    return 'Share'
  } else {
    return 'Share'
  }
}

/**
 * Detects if user is on mobile device
 * @returns boolean
 */
export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}