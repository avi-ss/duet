import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Preview runs in production mode and must use the same Pages base as build.
  base: mode === 'development' ? '/' : '/duet/',
  build: {
    // Pages can cache index.html briefly after a deployment. Stable filenames
    // keep that cached document usable while the new artifact propagates.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
}))
