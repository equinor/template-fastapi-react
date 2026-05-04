// Minimal ESLint flat config — runs ONLY @tanstack/eslint-plugin-query rules
// alongside Biome. Biome remains the formatter and primary linter; this file
// hosts the TanStack-specific rules Biome cannot express
// (queryKey-aware exhaustive-deps, prefer-query-options, mutation/infinite
// property order, etc.).
//
// Run with: `yarn lint:query` (or via mise: `mise run lint:web:query`).

import pluginQuery from '@tanstack/eslint-plugin-query'
import tseslint from 'typescript-eslint'

const recommended = pluginQuery.configs['flat/recommended']
const recommendedRules = {}
for (const c of Array.isArray(recommended) ? recommended : [recommended]) {
  Object.assign(recommendedRules, c.rules ?? {})
}

export default [
  {
    ignores: ['src/api-generated/**', 'build/**', 'node_modules/**', '.yarn/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    // We only enable the @tanstack/query rules — silence reports about
    // pre-existing `eslint-disable` directives for rules we don't load.
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@tanstack/query': pluginQuery,
    },
    rules: recommendedRules,
  },
]
