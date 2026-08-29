import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Tests de API corren en Node (fetch nativo, sin DOM)
    include: ['tests/api/**/*.test.ts'],
    environment: 'node',
    testTimeout: 15_000,
  },
})
