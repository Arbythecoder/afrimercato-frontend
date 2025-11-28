import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/',
    plugins: [react()],

    // Make env variables available in the app
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || 'https://afrimercato-api.fly.dev'
      )
    },
    
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            ui: ['framer-motion'],
            date: ['date-fns', 'react-date-range']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    
    server: {
      port: 5173,
      open: true
    }
  }
})