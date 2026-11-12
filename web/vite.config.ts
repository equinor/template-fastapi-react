import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, lazyPlugins } from 'vite-plus'
import fmt from '../oxfmt.config'
import csp from 'vite-plugin-csp-guard'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
  fmt,
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'react', 'jsx-a11y', 'import'],
    categories: { correctness: 'error' },
    ignorePatterns: ['src/api-generated/**', 'src/app/routeTree.gen.ts'],
    overrides: [
      {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
          '@tanstack/query/exhaustive-deps': 'error',
          '@tanstack/query/no-rest-destructuring': 'warn',
          '@tanstack/query/stable-query-client': 'error',
          '@tanstack/query/no-unstable-deps': 'error',
          '@tanstack/query/infinite-query-property-order': 'error',
          '@tanstack/query/mutation-property-order': 'error',
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['@/features/*/**'],
                  message: 'Import from the feature barrel (`@/features/<name>`), not its internals.',
                },
                {
                  group: ['@/shared/platform/*/**'],
                  message: 'Import from the platform barrel (`@/shared/platform/<name>`), not its internals.',
                },
              ],
            },
          ],
        },
        jsPlugins: ['@tanstack/eslint-plugin-query'],
      },
      {
        files: ['src/features/*/**/*.{ts,tsx}'],
        rules: { 'no-restricted-imports': 'off' },
      },
      {
        files: ['src/shared/**/*.{ts,tsx}'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['@/features/**', '@/app/**'],
                  message: '`shared/` must not import from `features/` or `app/`; move or invert the dependency.',
                },
              ],
            },
          ],
        },
      },
      {
        files: ['src/config/**/*.{ts,tsx}'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['@/app/**'],
                  message: '`config/` must not import from `app/`.',
                },
                {
                  group: ['@/features/*/**'],
                  message: 'Import from the feature barrel (`@/features/<name>`), not its internals.',
                },
              ],
            },
          ],
        },
      },
    ],
    options: { typeAware: true, typeCheck: true },
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'react/exhaustive-deps': 'off',
      'react/refs': 'warn',
      'jsx-a11y/prefer-tag-over-role': 'warn',
      'typescript/no-base-to-string': 'warn',
      'typescript/unbound-method': 'warn',
      'typescript/no-floating-promises': 'warn',
      'typescript/no-misused-spread': 'warn',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    server: { deps: { inline: [/@team-hermes\/react-components/] } },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    tailwindcss(),
    // Generate routes before React HMR, but not during tests.
    !process.env.VITEST &&
      tanstackRouter({
        target: 'react',
        routesDirectory: './src/app/routes',
        generatedRouteTree: './src/app/routeTree.gen.ts',
        autoCodeSplitting: true,
      }),
    react(),
    svgrPlugin(),
    csp({
      dev: { run: false },
      // Tailwind/EDS need runtime inline styles; App Insights fetches CDN config.
      // Telemetry ingestion stays on the same-origin /api/monitoring/ BFF.
      policy: {
        'default-src': ["'self'"],
        // Dynamic imports have no integrity attribute; hashes alone cannot authorize them.
        'script-src-elem': ["'self'"],
        'font-src': ["'self'", 'https://*.equinor.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://*.equinor.com'],
        'connect-src': ["'self'", 'https://js.monitor.azure.com'],
      },
      build: { sri: true },
      override: true,
    }),
  ]),
  server: {
    port: 3000,
    host: true,
    // Compose nginx strips /api/ before forwarding to FastAPI, as in production.
    proxy: {
      '/api': { target: 'http://127.0.0.1:80', changeOrigin: true },
    },
  },
  build: {
    outDir: 'build',
    // Keep maps private until CI can upload and remove them before publishing.
    sourcemap: false,
  },
})
