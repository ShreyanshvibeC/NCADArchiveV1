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
 * Creates a thumbnail from an image URL with proper CORS handling
 * @param imageUrl - Original image URL
 * @param maxSize - Maximum width/height for thumbnail (default: 300px)
 * @returns Promise<Blob> - Thumbnail image blob
 */
export const createThumbnail = async (imageUrl: string, maxSize: number = 300): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    // Handle CORS for Firebase Storage images
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
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
        
        // Clear canvas and draw image
        ctx?.clearRect(0, 0, width, height)
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Thumbnail created successfully, size:', blob.size)
              resolve(blob)
            } else {
              reject(new Error('Failed to create thumbnail blob'))
            }
          },
          'image/jpeg',
          0.8 // 80% quality for good balance of size/quality
        )
      } catch (error) {
        console.error('Error in thumbnail creation:', error)
        reject(error)
      }
    }
    
    img.onerror = (error) => {
      console.error('Failed to load image for thumbnail:', error)
      reject(new Error('Failed to load image for thumbnail creation'))
    }
    
    // Add timestamp to bypass cache issues
    const separator = imageUrl.includes('?') ? '&' : '?'
    img.src = `${imageUrl}${separator}t=${Date.now()}`
  })
}

/**
 * Fetches image as blob and creates thumbnail (fallback for CORS issues)
 * @param imageUrl - Original image URL
 * @param maxSize - Maximum width/height for thumbnail
 * @returns Promise<Blob> - Thumbnail image blob
 */
export const createThumbnailFromFetch = async (imageUrl: string, maxSize: number = 300): Promise<Blob> => {
  try {
    console.log('Fetching image via fetch API...')
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    
    const blob = await response.blob()
    console.log('Image fetched successfully, size:', blob.size)
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
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
          
          ctx?.clearRect(0, 0, width, height)
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (thumbnailBlob) => {
              if (thumbnailBlob) {
                console.log('Thumbnail created from fetch, size:', thumbnailBlob.size)
                resolve(thumbnailBlob)
              } else {
                reject(new Error('Failed to create thumbnail from fetched image'))
              }
            },
            'image/jpeg',
            0.8
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load fetched image'))
      }
      
      img.src = URL.createObjectURL(blob)
    })
  } catch (error) {
    console.error('Fetch method failed:', error)
    throw error
  }
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
  return 'share' in navigator
}

/**
 * Checks if the device can share files
 * @returns boolean
 */
export const canShareFiles = (): boolean => {
  return 'share' in navigator && 'canShare' in navigator
}

/**
 * Shares content using native share API with image attachment
 * @param shareData - Data to share
 * @returns Promise<boolean> - Success status
 */
export const shareWithNativeAPI = async (shareData: ShareData): Promise<boolean> => {
  try {
    const formattedData = prepareShareData(shareData)
    console.log('Starting native share process...')
    
    let thumbnailFile: File | undefined
    
    // Try to create thumbnail with multiple fallback methods
    try {
      console.log('Attempting to create thumbnail...')
      let thumbnailBlob: Blob
      
      try {
        // Method 1: Direct image loading with CORS
        thumbnailBlob = await createThumbnail(formattedData.imageUrl)
      } catch (corsError) {
        console.warn('Direct thumbnail creation failed, trying fetch method:', corsError)
        // Method 2: Fetch then create thumbnail
        thumbnailBlob = await createThumbnailFromFetch(formattedData.imageUrl)
      }
      
      // Create file from blob
      thumbnailFile = new File(
        [thumbnailBlob], 
        'ncad-archive-photo.jpg', 
        { type: 'image/jpeg' }
      )
      
      console.log('Thumbnail file created:', thumbnailFile.name, thumbnailFile.size)
    } catch (thumbnailError) {
      console.warn('All thumbnail creation methods failed:', thumbnailError)
      console.log('Proceeding with text-only share...')
    }
    
    // Prepare share payload
    const sharePayload: any = {
      title: formattedData.title,
      text: `${formattedData.description}\n\n${formattedData.pageUrl}`
    }
    
    // Add file if thumbnail was created successfully
    if (thumbnailFile) {
      sharePayload.files = [thumbnailFile]
      
      // Check if the payload with files can be shared
      if (navigator.canShare && !navigator.canShare(sharePayload)) {
        console.warn('Files not supported in share, removing files from payload')
        delete sharePayload.files
      }
    }
    
    console.log('Sharing payload:', {
      title: sharePayload.title,
      text: sharePayload.text,
      hasFiles: !!sharePayload.files,
      fileCount: sharePayload.files?.length || 0
    })
    
    await navigator.share(sharePayload)
    console.log('Share completed successfully')
    
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
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (fallbackError) {
        console.error('Fallback copy method also failed:', fallbackError)
        return false
      }
    }
  },
  
  /**
   * Share via WhatsApp
   */
  whatsapp: (title: string, description: string, url: string) => {
    const text = encodeURIComponent(`${title}\n\n${description}\n\n${url}`)
    const whatsappUrl = `https://wa.me/?text=${text}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  },
  
  /**
   * Share via Twitter
   */
  twitter: (title: string, description: string, url: string) => {
    const text = encodeURIComponent(`${title}\n\n${description}`)
    const shareUrl = encodeURIComponent(url)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  },
  
  /**
   * Share via Facebook
   */
  facebook: (url: string) => {
    const shareUrl = encodeURIComponent(url)
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
    window.open(facebookUrl, '_blank', 'noopener,noreferrer')
  },
  
  /**
   * Share via Email
   */
  email: (title: string, description: string, url: string) => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${description}\n\nView photo: ${url}`)
    const emailUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = emailUrl
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
    return 'Share Photo'
  } else if (userAgent.includes('android')) {
    return 'Share Photo'
  } else {
    return 'Share Photo'
  }
}

/**
 * Detects if user is on mobile device
 * @returns boolean
 */
export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Tests if image can be loaded with CORS
 * @param imageUrl - Image URL to test
 * @returns Promise<boolean>
 */
export const testImageCORS = async (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 1
        canvas.height = 1
        ctx?.drawImage(img, 0, 0, 1, 1)
        // If we can draw to canvas, CORS is working
        resolve(true)
      } catch (error) {
        resolve(false)
      }
    }
    
    img.onerror = () => resolve(false)
    img.src = imageUrl
  })
}