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
        // Mobile-optimized cache strategy for images
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mobile-firebase-images',
              expiration: {
                maxEntries: 50, // Fewer cached images for mobile
                maxAgeSeconds: 60 * 60 * 24 * 3 // 3 days on mobile vs 7 days desktop
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                // Add mobile-specific cache keys
                const url = new URL(request.url)
                const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                if (isMobile) {
                  url.searchParams.set('mobile', 'true')
                }
                return url.toString()
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-apis',
              expiration: {
                maxEntries: 30, // Reduced for mobile
                maxAgeSeconds: 60 * 60 * 12 // 12 hours on mobile
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    // Mobile-optimized bundle
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create mobile-specific chunks
          if (id.includes('mobile') || id.includes('touch')) {
            return 'mobile'
          }
          if (id.includes('firebase')) {
            return 'firebase'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize assets
    assetsInlineLimit: 2048, // Smaller inline limit for mobile
    // Enable compression with mobile optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'], // Remove console.logs in production
        passes: 2 // Multiple passes for better compression
      },
      mangle: {
        safari10: true // Better mobile Safari support
      }
    }
  },
  // Mobile-specific esbuild optimizations
  esbuild: {
    target: 'es2018', // Better mobile browser support
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  // Development server optimizations
  server: {
    hmr: {
      overlay: false
    }
  }
})