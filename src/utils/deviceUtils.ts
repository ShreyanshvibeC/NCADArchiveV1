/**
 * Device detection and mobile optimization utilities
 */

/**
 * Detects if the current device is mobile
 * @returns boolean
 */
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
}

/**
 * Detects if the current device is a tablet
 * @returns boolean
 */
export const isTabletDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase()
  const screenWidth = window.screen.width
  
  return /ipad|tablet|kindle|silk|playbook/i.test(userAgent) || 
         (screenWidth >= 768 && screenWidth <= 1024)
}

/**
 * Detects if the current device is desktop
 * @returns boolean
 */
export const isDesktopDevice = (): boolean => {
  return !isMobileDevice() && !isTabletDevice()
}

/**
 * Gets a user-friendly device type string
 * @returns string
 */
export const getDeviceType = (): string => {
  if (isMobileDevice()) return 'mobile device'
  if (isTabletDevice()) return 'tablet'
  return 'desktop'
}

/**
 * Locks screen orientation to portrait on mobile devices
 */
export const lockOrientationToPortrait = (): void => {
  if (!isMobileDevice()) return
  
  try {
    // Modern API
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch((error) => {
        console.warn('Could not lock orientation:', error)
      })
    }
    // Legacy API fallback
    else if ((screen as any).lockOrientation) {
      (screen as any).lockOrientation('portrait')
    }
    else if ((screen as any).mozLockOrientation) {
      (screen as any).mozLockOrientation('portrait')
    }
    else if ((screen as any).msLockOrientation) {
      (screen as any).msLockOrientation('portrait')
    }
  } catch (error) {
    console.warn('Orientation lock not supported or failed:', error)
  }
}

/**
 * Unlocks screen orientation
 */
export const unlockOrientation = (): void => {
  try {
    // Modern API
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock()
    }
    // Legacy API fallback
    else if ((screen as any).unlockOrientation) {
      (screen as any).unlockOrientation()
    }
    else if ((screen as any).mozUnlockOrientation) {
      (screen as any).mozUnlockOrientation()
    }
    else if ((screen as any).msUnlockOrientation) {
      (screen as any).msUnlockOrientation()
    }
  } catch (error) {
    console.warn('Orientation unlock not supported or failed:', error)
  }
}

/**
 * Adds CSS to prevent rotation on mobile devices
 */
export const addMobileOrientationStyles = (): void => {
  if (!isMobileDevice()) return
  
  const style = document.createElement('style')
  style.textContent = `
    @media screen and (orientation: landscape) and (max-height: 500px) {
      body {
        transform: rotate(90deg);
        transform-origin: left top;
        width: 100vh;
        height: 100vw;
        overflow-x: hidden;
        position: absolute;
        top: 100%;
        left: 0;
      }
    }
    
    /* Prevent zoom on mobile */
    @media screen and (max-width: 768px) {
      input, textarea, select {
        font-size: 16px !important;
      }
    }
  `
  document.head.appendChild(style)
}

/**
 * Shows a rotation warning message
 */
export const showRotationWarning = (): void => {
  if (!isMobileDevice()) return
  
  const handleOrientationChange = () => {
    if (window.orientation === 90 || window.orientation === -90) {
      // Landscape mode
      let warningDiv = document.getElementById('rotation-warning')
      
      if (!warningDiv) {
        warningDiv = document.createElement('div')
        warningDiv.id = 'rotation-warning'
        warningDiv.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            text-align: center;
            font-family: 'Spenser', sans-serif;
          ">
            <div style="
              background: #52489C;
              border-radius: 50%;
              width: 80px;
              height: 80px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
            ">
              <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 style="font-size: 24px; margin-bottom: 16px; font-weight: bold;">
              Please Rotate Your Device
            </h2>
            <p style="font-size: 16px; line-height: 1.5; color: #ccc; max-width: 300px;">
              NCAD Archive is optimized for portrait mode. Please rotate your device to portrait orientation for the best experience.
            </p>
          </div>
        `
        document.body.appendChild(warningDiv)
      }
    } else {
      // Portrait mode
      const warningDiv = document.getElementById('rotation-warning')
      if (warningDiv) {
        warningDiv.remove()
      }
    }
  }
  
  // Listen for orientation changes
  window.addEventListener('orientationchange', handleOrientationChange)
  
  // Check initial orientation
  setTimeout(handleOrientationChange, 100)
}