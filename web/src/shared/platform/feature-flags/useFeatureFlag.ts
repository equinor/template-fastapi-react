// Boolean hook for handlers and conditional rendering. For pure JSX
// gating, prefer `<FeatureToggle>`.
//
// Dev-only override: a `localStorage` entry under `flag:<NAME>`
// (`'1'` = on, `'0'` = off) wins over the configured rule. Stripped at
// build time in production (`import.meta.env.DEV` is statically false).
//
//   localStorage.setItem('flag:BULK_TOOLS', '1'); location.reload()
//   localStorage.removeItem('flag:BULK_TOOLS');   location.reload()

import { isEnabled, useFeatureFlagsContext } from './FeatureFlagsContext'

const readOverride = (flagName: string): boolean | null => {
  if (!import.meta.env.DEV) return null
  if (typeof localStorage === 'undefined') return null
  const v = localStorage.getItem(`flag:${flagName}`)
  if (v === '1') return true
  if (v === '0') return false
  return null
}

export const useFeatureFlag = <FlagName extends string>(flagName: FlagName): boolean => {
  const { flags, user } = useFeatureFlagsContext()
  const override = readOverride(flagName)
  if (override !== null) return override
  return isEnabled(flagName, user.roles, flags)
}
