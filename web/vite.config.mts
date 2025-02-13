import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import csp from 'vite-plugin-csp-guard'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
    }),
    react(),
    viteTsConfigPaths(),
    svgrPlugin(),
    csp({
      dev: {
        run: true,
      },
      policy: {
        'default-src': ["'self'"],
        'font-src': ["'self'", 'https://*.equinor.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://*.equinor.com'],
        'script-src-elem': ["'self'"],
        'connect-src': ['self', 'https://*.microsoftonline.com', 'http:', ' https:', 'ws:', 'wss:', 'data:', 'blob:'],
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
  },
  build: {
    outDir: 'build',
  },
})
