import { defineConfig } from 'vitest/config'

// Vite 8+ resolves `tsconfig.json` `paths` natively (see vite.config.mts).
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
