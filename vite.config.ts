import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Preview runs in production mode and must use the same Pages base as build.
  base: mode === 'development' ? '/' : '/duet/',
}))
