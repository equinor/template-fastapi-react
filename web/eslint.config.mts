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
    rules: {
      ...recommendedRules,
      // Feature-slice boundary: outside code may only import a feature
      // through its public barrel (`@/features/<name>`), never deep paths
      // like `@/features/<name>/api/...`. Inside-feature code uses
      // relative paths and is exempted by the override below.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message:
                'Import from the feature barrel (`@/features/<name>`), not its internals. ' +
                'If you need something not exported, add it to the barrel.',
            },
            {
              group: ['@/shared/platform/*/*'],
              message:
                'Import from the platform module barrel (`@/shared/platform/<name>`), not its ' +
                'internals. If you need something not exported, add it to the barrel.',
            },
          ],
        },
      ],
    },
  },
  {
    // Inside a feature, deep imports are fine — but prefer relative paths
    // (the rule still nudges that direction by allowing only relatives here).
    files: ['src/features/*/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // Layering: `shared/` is a downstream layer. It must not depend on
    // `features/` or `app/` — that would create a cycle (features import
    // shared; app composes both). Pure utilities only.
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/*/*', '@/app/*', '@/app/*/*'],
              message:
                '`shared/` must not import from `features/` or `app/`. ' +
                'Move the symbol down to `shared/` or invert the dependency.',
            },
          ],
        },
      ],
    },
  },
  {
    // Layering: `config/` may import `features/*` *barrels* (e.g.
    // `accessControl.ts` types its `Permissions` map against `Todo` from
    // `@/features/todos`). It must not depend on `app/`.
    files: ['src/config/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/app/*/*'],
              message: '`config/` must not import from `app/`.',
            },
            {
              group: ['@/features/*/*'],
              message: 'Import from the feature barrel (`@/features/<name>`), not its internals.',
            },
          ],
        },
      ],
    },
  },
]
