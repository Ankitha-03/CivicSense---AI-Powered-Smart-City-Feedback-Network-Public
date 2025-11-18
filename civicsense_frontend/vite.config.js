import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow serving files from the project root
      allow: [
        '..', // one level up (so it can access node_modules)
        path.resolve(__dirname, '../')
      ]
    }
  }
})
