/**
 * Smoke tests for `<FeatureToggle>` + the `isEnabled` evaluator. Covers
 *   - boolean on/off
 *   - role-gated rule allows matching role
 *   - role-gated rule blocks non-matching role
 */

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { setCurrentUserForTests } from '@/shared/platform/auth/auth'
import { FeatureFlagsProvider, isEnabled } from './FeatureFlagsContext'
import { FeatureToggle } from './FeatureToggle'

const FLAGS_ON = { DEMO: true } as const
const FLAGS_OFF = { DEMO: false } as const
const FLAGS_ROLE = { DEMO: [{ allowedRoles: ['admin'] }] } as const

afterEach(() => {
  setCurrentUserForTests(null)
})

describe('isEnabled', () => {
  test('boolean true → on', () => {
    expect(isEnabled('DEMO', [], { DEMO: true })).toBe(true)
  })
  test('boolean false → off', () => {
    expect(isEnabled('DEMO', [], { DEMO: false })).toBe(false)
  })
  test('role rule matches', () => {
    expect(isEnabled('DEMO', ['admin'], { DEMO: [{ allowedRoles: ['admin'] }] })).toBe(true)
  })
  test('role rule misses', () => {
    expect(isEnabled('DEMO', ['viewer'], { DEMO: [{ allowedRoles: ['admin'] }] })).toBe(false)
  })
  test('rule without allowedRoles is unconditional', () => {
    expect(isEnabled('DEMO', [], { DEMO: [{}] })).toBe(true)
  })
  test('unknown flag → false', () => {
    expect(isEnabled('MISSING', ['admin'], {})).toBe(false)
  })
})

describe('<FeatureToggle>', () => {
  test('renders children when enabled', () => {
    setCurrentUserForTests({ id: 'u1', name: 'u', roles: ['admin'] })
    render(
      <FeatureFlagsProvider flags={FLAGS_ON}>
        <FeatureToggle featureFlag="DEMO">
          <span>visible</span>
        </FeatureToggle>
      </FeatureFlagsProvider>
    )
    expect(screen.getByText('visible')).toBeDefined()
  })

  test('renders nothing when disabled', () => {
    setCurrentUserForTests({ id: 'u1', name: 'u', roles: ['admin'] })
    render(
      <FeatureFlagsProvider flags={FLAGS_OFF}>
        <FeatureToggle featureFlag="DEMO">
          <span>hidden</span>
        </FeatureToggle>
      </FeatureFlagsProvider>
    )
    expect(screen.queryByText('hidden')).toBeNull()
  })

  test('respects allowedRoles', () => {
    setCurrentUserForTests({ id: 'u1', name: 'u', roles: ['viewer'] })
    render(
      <FeatureFlagsProvider flags={FLAGS_ROLE}>
        <FeatureToggle featureFlag="DEMO">
          <span>admin-only</span>
        </FeatureToggle>
      </FeatureFlagsProvider>
    )
    expect(screen.queryByText('admin-only')).toBeNull()
  })
})
