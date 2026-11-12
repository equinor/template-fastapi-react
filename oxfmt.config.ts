export default {
  singleQuote: true,
  semi: false,
  printWidth: 119,
  trailingComma: 'es5' as const,
  sortImports: false,
  sortPackageJson: false,
  ignorePatterns: [
    '**/api/.openapi.json',
    '**/src/api-generated/**',
    '**/src/app/routeTree.gen.ts',
    '**/pnpm-lock.yaml',
    '**/oauth2/**',
    '**/nginx/**',
  ],
}
