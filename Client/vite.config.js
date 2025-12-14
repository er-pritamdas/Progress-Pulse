import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy:{
      '/api': 'http://backend:3000'
      // '/api': 'http://localhost:8000'
    },
  },
  plugins: [react(),tailwindcss()],
})
