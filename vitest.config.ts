import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
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
