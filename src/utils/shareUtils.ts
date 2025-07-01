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
 * Creates the custom share message format
 * @param shareData - Share data object
 * @returns Formatted share message
 */
export const createShareMessage = (shareData: ShareData): string => {
  const title = shareData.title || 'NCAD Archive Photo'
  const description = shareData.description || ''
  
  let message = `*${title}*` // Bold

  if (description) {
    message += `\n\n_${description}_` // Italic
  }

  message += `\n\nExplore creative trails from across NCAD — a window you might have overlooked.`
  message += `\n\nlink link 👉 ${shareData.pageUrl}`
  message += `\n\n#NCADArchive #NCADArchive`

  return message
}



/**
 * Creates a thumbnail from an image URL with enhanced CORS handling
 * @param imageUrl - Original image URL
 * @param maxSize - Maximum width/height for thumbnail (default: 300px)
 * @returns Promise<Blob> - Thumbnail image blob
 */
export const createThumbnail = async (imageUrl: string, maxSize: number = 300): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    // Enhanced CORS handling for Firebase Storage
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
              console.log('✅ Thumbnail created successfully, size:', blob.size)
              resolve(blob)
            } else {
              reject(new Error('Failed to create thumbnail blob'))
            }
          },
          'image/jpeg',
          0.8 // 80% quality for good balance of size/quality
        )
      } catch (error) {
        console.error('❌ Error in thumbnail creation:', error)
        reject(error)
      }
    }
    
    img.onerror = (error) => {
      console.error('❌ Failed to load image for thumbnail:', error)
      reject(new Error('Failed to load image for thumbnail creation - likely CORS issue'))
    }
    
    // Try multiple URL variations to bypass cache and CORS issues
    const urlVariations = [
      imageUrl, // Original URL
      `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}alt=media`, // Firebase Storage direct media
      `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`, // Cache busting
    ]
    
    let currentVariation = 0
    
    const tryNextUrl = () => {
      if (currentVariation < urlVariations.length) {
        console.log(`🔄 Trying image URL variation ${currentVariation + 1}:`, urlVariations[currentVariation])
        img.src = urlVariations[currentVariation]
        currentVariation++
      } else {
        reject(new Error('All URL variations failed'))
      }
    }
    
    // Override error handler to try next variation
    img.onerror = () => {
      console.warn(`⚠️ URL variation ${currentVariation} failed, trying next...`)
      if (currentVariation < urlVariations.length) {
        setTimeout(tryNextUrl, 100) // Small delay between attempts
      } else {
        reject(new Error('All image URL variations failed - CORS configuration needed'))
      }
    }
    
    // Start with first variation
    tryNextUrl()
  })
}

/**
 * Enhanced fetch-based thumbnail creation with better error handling
 * @param imageUrl - Original image URL
 * @param maxSize - Maximum width/height for thumbnail
 * @returns Promise<Blob> - Thumbnail image blob
 */
export const createThumbnailFromFetch = async (imageUrl: string, maxSize: number = 300): Promise<Blob> => {
  try {
    console.log('🔄 Attempting fetch-based thumbnail creation...')
    
    // Try different fetch configurations
    const fetchConfigs = [
      { mode: 'cors' as RequestMode, credentials: 'omit' as RequestCredentials },
      { mode: 'no-cors' as RequestMode, credentials: 'omit' as RequestCredentials },
      { mode: 'cors' as RequestMode, credentials: 'same-origin' as RequestCredentials }
    ]
    
    let response: Response | null = null
    let lastError: Error | null = null
    
    for (const config of fetchConfigs) {
      try {
        console.log(`🔄 Trying fetch with mode: ${config.mode}, credentials: ${config.credentials}`)
        response = await fetch(imageUrl, config)
        
        if (response.ok) {
          console.log('✅ Fetch successful with config:', config)
          break
        } else {
          console.warn(`⚠️ Fetch failed with status ${response.status}`)
        }
      } catch (fetchError: any) {
        console.warn(`⚠️ Fetch config failed:`, fetchError.message)
        lastError = fetchError
        continue
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error(`Failed to fetch image: ${response?.status || 'unknown error'}`)
    }
    
    const blob = await response.blob()
    console.log('✅ Image fetched successfully, size:', blob.size)
    
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
                console.log('✅ Thumbnail created from fetch, size:', thumbnailBlob.size)
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
    console.error('❌ Fetch method failed:', error)
    throw error
  }
}

/**
 * Proxy-based thumbnail creation (fallback for CORS issues)
 * @param imageUrl - Original image URL
 * @param maxSize - Maximum width/height for thumbnail
 * @returns Promise<Blob> - Thumbnail image blob
 */
export const createThumbnailViaProxy = async (imageUrl: string, maxSize: number = 300): Promise<Blob> => {
  try {
    console.log('🔄 Attempting proxy-based thumbnail creation...')
    
    // Use a CORS proxy service (for development/testing only)
    const proxyUrls = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
      `https://cors-anywhere.herokuapp.com/${imageUrl}`,
      // Add more proxy services as needed
    ]
    
    for (const proxyUrl of proxyUrls) {
      try {
        console.log('🔄 Trying proxy:', proxyUrl)
        const response = await fetch(proxyUrl)
        
        if (response.ok) {
          const blob = await response.blob()
          console.log('✅ Proxy fetch successful, size:', blob.size)
          
          // Create thumbnail from blob
          return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()
            
            img.onload = () => {
              try {
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
                      console.log('✅ Proxy thumbnail created, size:', thumbnailBlob.size)
                      resolve(thumbnailBlob)
                    } else {
                      reject(new Error('Failed to create proxy thumbnail'))
                    }
                  },
                  'image/jpeg',
                  0.8
                )
              } catch (error) {
                reject(error)
              }
            }
            
            img.onerror = () => reject(new Error('Failed to load proxy image'))
            img.src = URL.createObjectURL(blob)
          })
        }
      } catch (proxyError) {
        console.warn('⚠️ Proxy failed:', proxyError)
        continue
      }
    }
    
    throw new Error('All proxy methods failed')
  } catch (error) {
    console.error('❌ Proxy method failed:', error)
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
 * Enhanced share function with multiple thumbnail creation methods
 * @param shareData - Data to share
 * @returns Promise<boolean> - Success status
 */
export const shareWithNativeAPI = async (shareData: ShareData): Promise<boolean> => {
  try {
    const formattedData = prepareShareData(shareData)
    console.log('🚀 Starting enhanced native share process...')
    
    let thumbnailFile: File | undefined
    
    // Try multiple thumbnail creation methods in order of preference
    const thumbnailMethods = [
      { name: 'Direct CORS', method: () => createThumbnail(formattedData.imageUrl) },
      { name: 'Fetch API', method: () => createThumbnailFromFetch(formattedData.imageUrl) },
      { name: 'Proxy Service', method: () => createThumbnailViaProxy(formattedData.imageUrl) }
    ]
    
    for (const { name, method } of thumbnailMethods) {
      try {
        console.log(`🔄 Attempting thumbnail creation via ${name}...`)
        const thumbnailBlob = await method()
        
        // Create file from blob
        thumbnailFile = new File(
          [thumbnailBlob], 
          'ncad-archive-photo.jpg', 
          { type: 'image/jpeg' }
        )
        
        console.log(`✅ Thumbnail created via ${name}:`, thumbnailFile.name, thumbnailFile.size)
        break // Success, exit loop
      } catch (methodError) {
        console.warn(`⚠️ ${name} method failed:`, methodError)
        continue // Try next method
      }
    }
    
    if (!thumbnailFile) {
      console.warn('⚠️ All thumbnail creation methods failed, proceeding with text-only share')
    }
    
    // Create the custom share message
    const shareMessage = createShareMessage(formattedData)
    
    // Prepare share payload
    const sharePayload: any = {
      title: formattedData.title,
      text: shareMessage
    }
    
    // Add file if thumbnail was created successfully
    if (thumbnailFile) {
      sharePayload.files = [thumbnailFile]
      
      // Check if the payload with files can be shared
      if (navigator.canShare && !navigator.canShare(sharePayload)) {
        console.warn('⚠️ Files not supported in share, removing files from payload')
        delete sharePayload.files
      } else {
        console.log('✅ File sharing supported, including thumbnail')
      }
    }
    
    console.log('📤 Sharing payload:', {
      title: sharePayload.title,
      text: sharePayload.text.substring(0, 100) + '...',
      hasFiles: !!sharePayload.files,
      fileCount: sharePayload.files?.length || 0
    })
    
    await navigator.share(sharePayload)
    console.log('🎉 Share completed successfully')
    
    return true
  } catch (error: any) {
    console.error('❌ Native share failed:', error)
    
    // If user cancelled, don't treat as error
    if (error.name === 'AbortError') {
      console.log('👤 Share cancelled by user')
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
   * Copy link to clipboard with enhanced error handling
   */
  copyLink: async (shareData: ShareData): Promise<boolean> => {
    try {
      const shareMessage = createShareMessage(shareData)
      await navigator.clipboard.writeText(shareMessage)
      console.log('✅ Share message copied to clipboard via Clipboard API')
      return true
    } catch (error) {
      console.warn('⚠️ Clipboard API failed, trying fallback method:', error)
      // Fallback for older browsers
      try {
        const shareMessage = createShareMessage(shareData)
        const textArea = document.createElement('textarea')
        textArea.value = shareMessage
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          console.log('✅ Share message copied via fallback method')
          return true
        } else {
          throw new Error('execCommand copy failed')
        }
      } catch (fallbackError) {
        console.error('❌ All copy methods failed:', fallbackError)
        return false
      }
    }
  },
  
  /**
   * Share via WhatsApp
   */
  whatsapp: (shareData: ShareData) => {
    const shareMessage = createShareMessage(shareData)
    const text = encodeURIComponent(shareMessage)
    const whatsappUrl = `https://wa.me/?text=${text}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    console.log('📱 Opened WhatsApp share')
  },
  
  /**
   * Share via Twitter
   */
  twitter: (shareData: ShareData) => {
    const shareMessage = createShareMessage(shareData)
    const text = encodeURIComponent(shareMessage)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
    console.log('🐦 Opened Twitter share')
  },
  
  /**
   * Share via Facebook
   */
  facebook: (shareData: ShareData) => {
    const shareUrl = encodeURIComponent(shareData.pageUrl)
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
    window.open(facebookUrl, '_blank', 'noopener,noreferrer')
    console.log('📘 Opened Facebook share')
  },
  
  /**
   * Share via Email
   */
  email: (shareData: ShareData) => {
    const shareMessage = createShareMessage(shareData)
    const subject = encodeURIComponent(shareData.title || 'NCAD Archive Photo')
    const body = encodeURIComponent(shareMessage)
    const emailUrl = `mailto:?subject=${subject}&body=${body}`
    window.location.href = emailUrl
    console.log('📧 Opened email share')
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
      console.error('❌ Native sharing failed, showing fallback options:', error)
      
      if (showFallbackOptions) {
        // Return false to indicate fallback should be shown
        return false
      }
      
      throw error
    }
  }
  
  // If native sharing not supported, return false to show fallback options
  console.log('📱 Native sharing not supported, showing fallback options')
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
        console.log('✅ CORS test passed')
        resolve(true)
      } catch (error) {
        console.log('❌ CORS test failed:', error)
        resolve(false)
      }
    }
    
    img.onerror = () => {
      console.log('❌ CORS test failed: image load error')
      resolve(false)
    }
    
    img.src = imageUrl
  })
}

/**
 * Gets Firebase Storage bucket name from image URL
 * @param imageUrl - Firebase Storage image URL
 * @returns string | null - Bucket name or null if not a Firebase Storage URL
 */
export const getFirebaseStorageBucket = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl)
    if (url.hostname.includes('firebasestorage.googleapis.com')) {
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'b')
      if (bucketIndex !== -1 && pathParts[bucketIndex + 1]) {
        return pathParts[bucketIndex + 1]
      }
    }
    return null
  } catch {
    return null
  }
}