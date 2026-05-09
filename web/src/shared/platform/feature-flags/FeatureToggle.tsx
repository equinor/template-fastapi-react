import type { ReactNode } from 'react'
import { useFeatureFlag } from './useFeatureFlag'

export const FeatureToggle = <FlagName extends string>({
  featureFlag,
  children,
}: {
  featureFlag: FlagName
  children: ReactNode
}) => (useFeatureFlag(featureFlag) ? children : null)
