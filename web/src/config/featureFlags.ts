/**
 * App-level feature flags. Mirrors CoreDM's `FeatureFlagsContext.tsx`
 * config object — but the platform machinery lives in
 * `shared/platform/feature-flags/`, so this file is just declaration.
 *
 * Add a flag:
 *   1. Append to `FeatureFlagName`.
 *   2. Add a row to `FEATURE_FLAGS` (boolean OR `[{ allowedRoles: [...] }]`).
 *   3. Reference via `<FeatureToggle featureFlag={FeatureFlagName.X}>`
 *      or `useFeatureFlag(FeatureFlagName.X)`.
 */

import { ENV } from '@/config/env'
import type { FeatureFlagsTable } from '@/shared/platform/feature-flags/FeatureFlagsContext'

export enum FeatureFlagName {
  /** Show the create-todo form. Demo flag — on in dev, off in prod. */
  NEW_TODO_FORM = 'NEW_TODO_FORM',
}

export const FEATURE_FLAGS: FeatureFlagsTable<FeatureFlagName> = {
  [FeatureFlagName.NEW_TODO_FORM]: ENV.isDev,
} as const
