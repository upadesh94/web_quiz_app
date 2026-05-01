import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['Chrome 81'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
})
