import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/afrimercato-frontend/', //match your repo name
  plugins: [react()],
  css: {
    preprocessorOptions: {
      css: { charset: false }
    }
  },
  optimizeDeps: {
    include: ['react-date-range']
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
