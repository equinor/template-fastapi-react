/**
 * `<FeatureToggle featureFlag={…}>{children}</FeatureToggle>` — port of
 * CoreDM's `common/components/FeatureToggle/FeatureToggle.tsx`. Renders
 * `children` only when the flag is enabled for the current user;
 * otherwise renders `null`.
 */

import type { ReactNode } from 'react'
import { useFeatureFlag } from './useFeatureFlag'

type Props<FlagName extends string> = {
  featureFlag: FlagName
  children: ReactNode
}

export const FeatureToggle = <FlagName extends string>({ featureFlag, children }: Props<FlagName>) =>
  useFeatureFlag(featureFlag) ? children : null
