import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import csp from 'vite-plugin-csp-guard'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
  // Vite 8+ resolves referenced app tsconfig `paths` natively — no plugin needed.
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
      typescript: {
        buildMode: true,
      },
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
  ],
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
