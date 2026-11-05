import { defineConfig } from 'vitest/config'

// Vite 8+ resolves referenced app tsconfig `paths` natively (see vite.config.mts).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
