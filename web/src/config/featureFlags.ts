/**
 * App-level feature flags. The platform machinery lives in
 * `shared/platform/feature-flags/`, so this file is just declaration.
 *
 * Add a flag:
 *   1. Add a string entry to the `FeatureFlagName` const object.
 *   2. Add a row to `FEATURE_FLAGS` (boolean OR `[{ allowedRoles: [...] }]`).
 *   3. Reference via `<FeatureToggle featureFlag={FeatureFlagName.X}>`
 *      or `useFeatureFlag(FeatureFlagName.X)`.
 */

import type { FeatureFlagsTable } from '@/shared/platform/feature-flags'

export const FeatureFlagName = {
  /** Show the create-todo form in every environment (boolean flag example). */
  NEW_TODO_FORM: 'NEW_TODO_FORM',
  /**
   * Bulk operations on todos (e.g. "Clear completed"). Demo flag — admin only
   * (role-gated form). Demonstrates `FeatureFlagRule[]` with `allowedRoles`.
   */
  BULK_TOOLS: 'BULK_TOOLS',
} as const

export type FeatureFlagName = (typeof FeatureFlagName)[keyof typeof FeatureFlagName]

export const FEATURE_FLAGS: FeatureFlagsTable<FeatureFlagName> = {
  [FeatureFlagName.NEW_TODO_FORM]: true,
  [FeatureFlagName.BULK_TOOLS]: [{ allowedRoles: ['admin'] }],
} as const
