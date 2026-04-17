import type { UserConfig } from '@hey-api/openapi-ts'

export default {
  input: '../api/.openapi.json',
  output: './src/api/generated',
  plugins: [
    {
      name: '@hey-api/client-fetch',
    },
    '@hey-api/typescript',
    '@hey-api/sdk',
  ],
} satisfies UserConfig
