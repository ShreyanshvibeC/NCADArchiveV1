import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon.ico'],
      manifest: {
        name: 'NCAD Archive',
        short_name: 'NCAD Archive',
        description: 'A collaborative platform for NCAD students to share campus photography',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Enhanced cache strategy for images
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-images',
              expiration: {
                maxEntries: 200, // Increased from 100
                maxAgeSeconds: 60 * 60 * 24 * 14 // 14 days instead of 7
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                // Remove query parameters for better cache hits
                const url = new URL(request.url)
                url.search = ''
                return url.href
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-apis',
              expiration: {
                maxEntries: 100, // Increased from 50
                maxAgeSeconds: 60 * 60 * 24 * 3 // 3 days instead of 1
              }
            }
          },
          // Cache for fonts
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    // Enhanced bundle optimization
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          utils: ['./src/utils/imageUtils', './src/utils/shareUtils', './src/utils/deviceUtils']
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: false, // Disable in production for smaller bundle
    // Optimize assets
    assetsInlineLimit: 8192, // Increased from 4096
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'] // Remove specific console methods
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  // Development server optimizations
  server: {
    hmr: {
      overlay: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
  }
})