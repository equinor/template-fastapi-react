import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import csp from 'vite-plugin-csp-guard'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tailwindcss(),
    checker({
      typescript: true,
    }),
    react(),
    viteTsConfigPaths(),
    svgrPlugin(),
    csp({
      dev: {
        run: false,
      },
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
  },
})
