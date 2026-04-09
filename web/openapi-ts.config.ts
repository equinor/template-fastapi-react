import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../api/.openapi.json',
  output: './src/api/generated',
  plugins: [
    {
      name: '@hey-api/client-fetch',
    },
    '@hey-api/typescript',
    '@hey-api/sdk',
  ],
})
