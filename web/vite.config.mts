import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import csp from 'vite-plugin-csp-guard'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
  // Vite 8+ resolves `tsconfig.json` `paths` natively — no plugin needed.
  // Replaces the previous `vite-tsconfig-paths` dependency.
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    // File-based routing: scans `src/app/routes/` and emits `src/app/routeTree.gen.ts`.
    // MUST run before `react()` so the generated module is hot-replaceable.
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    checker({
      typescript: true,
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
      //   `connect-src 'http:' 'https:'`
      //     Allows arbitrary-origin connections so the App Insights SDK
      //     can ship telemetry to the configured ingestion endpoint
      //     without needing the URL at build time.
      policy: {
        'default-src': ["'self'"],
        'font-src': ["'self'", 'https://*.equinor.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://*.equinor.com'],
        'connect-src': ["'self'", 'https://*.microsoftonline.com', 'http:', ' https:'],
      },
      build: {
        sri: true,
      },
      override: true,
    }),
  ],
  server: {
    port: 3000,
    host: true,
    // Dev: forward /api to the docker-compose nginx on :80, which strips the
    // /api/ prefix and proxies to the FastAPI service. Keeps URL shape
    // identical to production.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'build',
    // 'hidden' emits .map files but omits the //# sourceMappingURL=
    // comment, so browsers never fetch them. App Insights symbolicates
    // server-side from sourcemaps uploaded to the AI resource's symbol
    // store (Azure portal → App Insights → Source map support, or
    // `az monitor app-insights ...`). Upload `build/assets/*.map` from
    // CI and exclude them from the static-hosting artifact.
    sourcemap: 'hidden',
  },
})
