import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa' // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({ // Add the PWA plugin configuration
      registerType: 'autoUpdate', // Automatically update SW when new content is available
      injectRegister: 'auto', // Inject the SW registration script
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'], // Cache common static assets
        cleanupOutdatedCaches: true, // Remove old caches
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // Include specific assets like icons
      manifest: { // Your Web App Manifest configuration
        name: 'Area Calculator (Ft/In)',
        short_name: 'AreaCalc',
        description: 'स्क्वायर फुट, गहन फुट निकाले',
        theme_color: '#ffffff', // Or your app's theme color
        background_color: '#ffffff', // Color shown before CSS loads
        display: 'standalone', // Makes it feel like a native app (no browser UI)
        scope: '/',
        start_url: '/', // The page loaded when the app starts
        icons: [ // Define app icons for different sizes
          {
            src: 'pwa-192x192.png', // You'll need to create these icon files
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // You'll need to create these icon files
            sizes: '512x512',
            type: 'image/png'
          },
          {
             src: 'pwa-512x512.png', // Maskable icon is recommended for Android
             sizes: '512x512',
             type: 'image/png',
             purpose: 'maskable'
           }
        ]
      }
    })
  ],
})