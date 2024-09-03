import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
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
  ],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'build',
  },
})
