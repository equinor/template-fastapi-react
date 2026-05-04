/**
 * `useFeatureFlag(name)` — boolean hook for handlers and conditional
 * rendering. For pure JSX gating, prefer `<FeatureToggle>`.
 */

import { getCurrentUser } from '@/shared/platform/auth/auth'
import { isEnabled, useFeatureFlagsContext } from './FeatureFlagsContext'

export const useFeatureFlag = <FlagName extends string>(flagName: FlagName): boolean => {
  const flags = useFeatureFlagsContext()
  const user = getCurrentUser()
  return isEnabled(flagName, user?.roles ?? [], flags)
}
