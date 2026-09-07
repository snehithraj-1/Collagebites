import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import express from 'express'
import apiRouter from './server/api.js'

const apiApp = express()
apiApp.use('/api', apiRouter)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        // Mount backend Express app on connect middleware in local development
        server.middlewares.use(apiApp)
      }
    }
  ],
  // Keep DATABASE_URL private to server only (never exposed to client bundle)
  envPrefix: ['VITE_'],
  server: {
    port: 5174,
    host: true
  }
})

