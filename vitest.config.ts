import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['tests/api/**/*.test.ts'],
    environment: 'node',
    testTimeout: 15_000,
    env: loadEnv(mode, process.cwd(), ''),
    setupFiles: ['./tests/api/setup.ts'],
  },
}))