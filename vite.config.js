import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: true,
    // Improve chunking strategy for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query']
        }
      }
    },
  },
  // Handle SPA routing for Vercel
  preview: {
    port: 4173,
    open: true,
    // Serve all routes as index.html for SPA
    proxy: {
      '/': {
        target: 'index.html',
        changeOrigin: true,
        rewrite: (path) => 'index.html'
      }
    }
  }
}) 