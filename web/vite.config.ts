import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, lazyPlugins } from 'vite-plus'
import csp from 'vite-plugin-csp-guard'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
  fmt: {
    singleQuote: true,
    semi: false,
    printWidth: 119,
    trailingComma: 'es5',
    sortImports: false,
    sortPackageJson: false,
    ignorePatterns: [
      'src/api-generated/**',
      'src/app/routeTree.gen.ts',
      'build/**',
      'node_modules/**',
      'pnpm-lock.yaml',
      'oauth2/**',
      'nginx/**',
    ],
  },
  lint: {
    plugins: ['oxc', 'typescript', 'unicorn', 'react', 'jsx-a11y', 'import'],
    categories: {
      correctness: 'error',
    },
    env: {
      builtin: true,
    },
    ignorePatterns: ['src/api-generated/**', 'src/app/routeTree.gen.ts', 'build/**', 'node_modules/**'],
    overrides: [
      {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
          '@tanstack/query/exhaustive-deps': 'error',
          '@tanstack/query/no-rest-destructuring': 'warn',
          '@tanstack/query/stable-query-client': 'error',
          '@tanstack/query/no-unstable-deps': 'error',
          '@tanstack/query/infinite-query-property-order': 'error',
          // Needs ESLint parserServices; inert here and in the previous untyped ESLint config.
          '@tanstack/query/no-void-query-fn': 'error',
          '@tanstack/query/mutation-property-order': 'error',
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['@/features/*/**'],
                  message:
                    'Import from the feature barrel (`@/features/<name>`), not its internals. If you need something not exported, add it to the barrel.',
                },
                {
                  group: ['@/shared/platform/*/**'],
                  message:
                    'Import from the platform module barrel (`@/shared/platform/<name>`), not its internals. If you need something not exported, add it to the barrel.',
                },
              ],
            },
          ],
        },
        jsPlugins: ['@tanstack/eslint-plugin-query'],
      },
      {
        files: ['src/features/*/**/*.{ts,tsx}'],
        rules: {
          'no-restricted-imports': 'off',
        },
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
                  message:
                    '`shared/` must not import from `features/` or `app/`. Move the symbol down to `shared/` or invert the dependency.',
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
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'react/exhaustive-deps': 'off',
      'react/button-has-type': 'off',
      // Additional Oxlint checks not enforced by the previous toolchain.
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
  },
  // Vite 8+ resolves referenced app tsconfig `paths` natively — no plugin needed.
  // Replaces the previous `vite-tsconfig-paths` dependency.
  resolve: {
    tsconfigPaths: true,
  },
  plugins: lazyPlugins(() => [
    tailwindcss(),
    // File-based routing: scans `src/app/routes/` and emits `src/app/routeTree.gen.ts`.
    // MUST run before `react()` so the generated module is hot-replaceable.
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
      dev: {
        run: false,
      },
      // CSP is intentionally tight. Notes on the looser-looking entries:
      //   `style-src 'unsafe-inline'`
      //     Required by Tailwind 4 + EDS, both of which inject runtime
      //     styles via inline <style> tags (Tailwind for arbitrary values
      //     and EDS for theme tokens). Browser nonces aren't viable
      //     because the inline injections happen post-load. The CSP
      //     plugin still hashes static styles for production builds.
      //   `connect-src https://js.monitor.azure.com`
      //     App Insights fetches its SDK configuration from this CDN.
      //     Ingestion itself uses the same-origin /api/monitoring/ BFF.
      policy: {
        'default-src': ["'self'"],
        // ES module imports have no script element carrying an integrity
        // attribute, so the plugin's hashes alone cannot authorize them.
        'script-src-elem': ["'self'"],
        'font-src': ["'self'", 'https://*.equinor.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://*.equinor.com'],
        'connect-src': ["'self'", 'https://js.monitor.azure.com'],
      },
      build: {
        sri: true,
      },
      override: true,
    }),
  ]),
  server: {
    port: 3000,
    host: true,
    // Dev: forward /api to the docker-compose nginx on :80, which strips the
    // /api/ prefix and proxies to the FastAPI service. Keeps URL shape
    // identical to production.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:80',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    // Keep maps out of the public image until CI uploads them privately
    // and removes them from the static-hosting artifact.
    sourcemap: false,
  },
})
