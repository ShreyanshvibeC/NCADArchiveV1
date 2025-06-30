import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['ncad-archive-favicon.png', 'favicon.ico'],
      manifest: {
        name: 'NCAD Archive',
        short_name: 'NCAD Archive',
        description: 'A collaborative platform for NCAD students to share campus photography',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'ncad-archive-favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'ncad-archive-favicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Cache strategy for images
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-apis',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize assets
    assetsInlineLimit: 4096,
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Development server optimizations
  server: {
    hmr: {
      overlay: false
    }
  }
})