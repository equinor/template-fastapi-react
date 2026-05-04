/**
 * Feature flag platform — generic. Mirrors CoreDM's
 * `FeatureFlagsContext.tsx`: the context carries
 * `Record<FlagName, FlagRule[] | boolean>`. Apps choose their own
 * `FlagName` enum and provide the table; this module is just plumbing.
 *
 * `<FeatureToggle>` and `useFeatureFlag()` (siblings in this folder)
 * read from this context.
 */

import { createContext, type ReactNode, useContext, useMemo } from 'react'

export type FeatureFlagRule = {
  /**
   * If present, the flag is on only when the current user has at least
   * one of these roles. If absent, the rule is unconditional.
   */
  allowedRoles?: readonly string[]
}

/**
 * `boolean` for hard on/off; `FeatureFlagRule[]` for role-gated flags.
 */
export type FeatureFlagValue = boolean | readonly FeatureFlagRule[]

export type FeatureFlagsTable<FlagName extends string> = Readonly<Record<FlagName, FeatureFlagValue>>

// Context is keyed by string at the React layer; the typed surface comes
// from `useFeatureFlag<FlagName>()` and `<FeatureToggle<FlagName>>`.
const FeatureFlagsContext = createContext<FeatureFlagsTable<string>>({})

export const FeatureFlagsProvider = <FlagName extends string>({
  flags,
  children,
}: {
  flags: FeatureFlagsTable<FlagName>
  children: ReactNode
}) => {
  // Spread to a fresh object so context consumers re-render only when the
  // table contents actually change (the caller is expected to memoise).
  const value = useMemo(() => ({ ...flags }), [flags])
  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export const useFeatureFlagsContext = (): FeatureFlagsTable<string> => useContext(FeatureFlagsContext)

/**
 * Pure evaluator — exported so non-React code (loaders, plain modules)
 * can check flags too, given a snapshot of the table and the user roles.
 */
export const isEnabled = (
  flagName: string | undefined,
  userRoles: readonly string[],
  flags: FeatureFlagsTable<string>
): boolean => {
  if (!flagName) return false
  const value = flags[flagName]
  if (typeof value === 'boolean') return value
  if (!Array.isArray(value)) return false
  return value.some((rule) => {
    if (!rule.allowedRoles) return true
    return rule.allowedRoles.some((role: string) => userRoles.includes(role))
  })
}
