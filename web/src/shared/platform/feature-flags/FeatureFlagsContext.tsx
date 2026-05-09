// Generic feature-flag context: holds the flag table plus the subject
// (typically the current user) the flags are evaluated against. Apps
// pick their own `FlagName` enum and supply both at the provider.

import { createContext, type ReactNode, useContext, useMemo } from 'react'
import type { FeatureFlagsSubject, FeatureFlagsTable } from './types'

interface FeatureFlagsContextValue {
  flags: FeatureFlagsTable<string>
  user: FeatureFlagsSubject
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({ flags: {}, user: { roles: [] } })

export const FeatureFlagsProvider = <FlagName extends string, U extends FeatureFlagsSubject>({
  flags,
  user,
  children,
}: {
  flags: FeatureFlagsTable<FlagName>
  user: U
  children: ReactNode
}) => {
  const value = useMemo(() => ({ flags: { ...flags }, user }), [flags, user])
  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export const useFeatureFlagsContext = (): FeatureFlagsContextValue => useContext(FeatureFlagsContext)

/** Pure evaluator — usable from loaders / plain modules given a flag-table snapshot and roles. */
export const isEnabled = (
  flagName: string | undefined,
  userRoles: readonly string[],
  flags: FeatureFlagsTable<string>
): boolean => {
  if (!flagName) return false
  const value = flags[flagName]
  if (typeof value === 'boolean') return value
  if (!Array.isArray(value)) return false
  return value.some((rule) => !rule.allowedRoles || rule.allowedRoles.some((role: string) => userRoles.includes(role)))
}
