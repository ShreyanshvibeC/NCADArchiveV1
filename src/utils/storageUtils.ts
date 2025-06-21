/**
 * Extracts the storage path from a Firebase Storage download URL
 * @param downloadURL - The full Firebase Storage download URL
 * @returns The storage path that can be used with Firebase Storage ref()
 */
export const extractStoragePathFromURL = (downloadURL: string): string | null => {
  try {
    const url = new URL(downloadURL)
    
    // Check if it's a Firebase Storage URL
    if (!url.hostname.includes('firebasestorage.googleapis.com')) {
      console.warn('URL is not a Firebase Storage URL')
      return null
    }
    
    // Extract the path from the URL
    // Firebase Storage URLs have the format:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?...
    const pathMatch = url.pathname.match(/\/o\/(.+)/)
    
    if (!pathMatch) {
      console.warn('Could not extract path from Firebase Storage URL')
      return null
    }
    
    // Decode the URL-encoded path
    const encodedPath = pathMatch[1]
    const decodedPath = decodeURIComponent(encodedPath)
    
    console.log('Extracted storage path:', decodedPath)
    return decodedPath
  } catch (error) {
    console.error('Error extracting storage path from URL:', error)
    return null
  }
}

/**
 * Validates if a string is a valid Firebase Storage download URL
 * @param url - The URL to validate
 * @returns True if it's a valid Firebase Storage URL
 */
export const isFirebaseStorageURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('firebasestorage.googleapis.com') && 
           urlObj.pathname.includes('/o/')
  } catch {
    return false
  }
}