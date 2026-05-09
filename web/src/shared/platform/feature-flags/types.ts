// Public types for the feature-flags platform module.

/** If `allowedRoles` is set, the rule matches only those roles; otherwise unconditional. */
export type FeatureFlagRule = {
  allowedRoles?: readonly string[]
}

/** `boolean` for hard on/off; `FeatureFlagRule[]` for role-gated flags. */
export type FeatureFlagValue = boolean | readonly FeatureFlagRule[]

export type FeatureFlagsTable<FlagName extends string> = Readonly<Record<FlagName, FeatureFlagValue>>

/**
 * Minimum shape of the subject the flags evaluate against. Apps pass
 * their full user object; widen when adding rules that gate on `id`
 * or other fields.
 */
export interface FeatureFlagsSubject {
  readonly roles: readonly string[]
}
