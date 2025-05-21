import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to your Flask backend
      '/api': {
        target: 'http://127.0.0.1:5000', // Your backend address
        changeOrigin: true, // Recommended for virtual hosted sites
        // secure: false, // Uncomment if your backend is http and vite dev server is https
        // rewrite: (path) => path.replace(/^\/api/, '') // Only if backend doesn't expect /api prefix
      }
    }
  }
})