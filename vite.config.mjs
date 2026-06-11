import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Explicit Vite config so the React plugin is always applied (Fast Refresh, JSX runtime)
// and so we have a single place to tweak build output later (chunk splitting, env, proxy, etc.).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward API calls to the Express backend during development so the frontend
    // can use relative URLs and we avoid CORS noise locally.
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split vendor chunks so they cache independently from app code.
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }
        },
      },
    },
  },
})

