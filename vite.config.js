import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for GitHub Pages - use repository name (you'll need to replace this with your actual repository name)
  base: "/ffxi-armor-tracker/",
  plugins: [react()],
  server: {
    fs: {
      strict: false
    }
  },
  build: {
    // Add cache busting for JSON files
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
