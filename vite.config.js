import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/skyrim-quest-checklist-project/',
  build: {
    outDir: 'dist',
  },
})
