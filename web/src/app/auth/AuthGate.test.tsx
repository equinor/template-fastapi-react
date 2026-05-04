/**
 * AuthGate dispatches based on the AuthSession returned from the
 * `useAuthSession` hook. We mock the hook directly to drive each branch.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { AuthSession } from '@/shared/platform/auth/useAuthSession'
import { AuthGate } from './AuthGate'

const mocks = vi.hoisted(() => ({
  useAuthSession: vi.fn<() => AuthSession>(),
}))
vi.mock('@/shared/platform/auth/useAuthSession', () => ({
  useAuthSession: mocks.useAuthSession,
}))

const session = (overrides: Partial<AuthSession> = {}): AuthSession => ({
  token: null,
  error: null,
  loginInProgress: false,
  isAuthenticated: false,
  username: null,
  logIn: () => {},
  logOut: () => {},
  ...overrides,
})

beforeEach(() => mocks.useAuthSession.mockReset())

describe('AuthGate', () => {
  test('renders the error screen when session.error is set', () => {
    mocks.useAuthSession.mockReturnValue(session({ error: 'boom' }))
    render(
      <AuthGate>
        <div>protected</div>
      </AuthGate>
    )
    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(screen.queryByText('protected')).toBeNull()
  })

  test('renders the loading screen while login is in progress', () => {
    mocks.useAuthSession.mockReturnValue(session({ loginInProgress: true }))
    render(
      <AuthGate>
        <div>protected</div>
      </AuthGate>
    )
    expect(screen.getByText('Login in progress.')).toBeInTheDocument()
    expect(screen.queryByText('protected')).toBeNull()
  })

  test('renders the login button when unauthenticated and triggers logIn on click', async () => {
    const logIn = vi.fn()
    mocks.useAuthSession.mockReturnValue(session({ logIn }))
    render(
      <AuthGate>
        <div>protected</div>
      </AuthGate>
    )
    const button = screen.getByRole('button', { name: 'Log in' })
    await userEvent.click(button)
    expect(logIn).toHaveBeenCalledOnce()
    expect(screen.queryByText('protected')).toBeNull()
  })

  test('renders children when authenticated', () => {
    mocks.useAuthSession.mockReturnValue(session({ isAuthenticated: true, token: 'abc' }))
    render(
      <AuthGate>
        <div>protected</div>
      </AuthGate>
    )
    expect(screen.getByText('protected')).toBeInTheDocument()
  })
})
