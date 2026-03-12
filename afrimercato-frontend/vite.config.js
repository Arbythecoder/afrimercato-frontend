import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')

  // Use root path for Cloudflare Pages, subfolder for GitHub Pages
  const isGitHubPages = process.env.DEPLOY_TARGET === 'github'

  return {
    base: isGitHubPages ? '/afrimercato-frontend/' : '/',
    plugins: [react()],

    // Make env variables available in the app
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || 'https://afrimercato-backend.fly.dev'
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