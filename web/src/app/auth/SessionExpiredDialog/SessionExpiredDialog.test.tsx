/**
 * SessionExpiredDialog reads `sessionExpiredStore` (latched by
 * `httpClient` on 401). Tests cover both directions:
 *   1. store is notified → dialog opens
 *   2. popup posts AUTH_SUCCESS_MESSAGE → store is cleared
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { createQueryClient } from '@/app/bootstrap/createQueryClient'
import { Providers } from '@/app/bootstrap/Providers'
import { AUTH_SUCCESS_MESSAGE, sessionExpiredStore } from '@/shared/platform/auth'
import { createTelemetry, TelemetryBackend } from '@/shared/platform/telemetry'

const telemetry = createTelemetry(TelemetryBackend.None)
const renderProviders = () =>
  render(
    <Providers queryClient={createQueryClient({ telemetry })} telemetry={telemetry}>
      {null}
    </Providers>
  )

afterEach(() => {
  sessionExpiredStore._reset()
  vi.restoreAllMocks()
})

describe('SessionExpiredDialog', () => {
  test('opens when the session-expired store is notified', async () => {
    renderProviders()

    expect(screen.queryByText('Session expired')).toBeNull()

    sessionExpiredStore.notify()

    await waitFor(() => {
      expect(screen.getByText('Session expired')).toBeDefined()
    })
  })

  test('reads a pre-existing latched flag on first render', () => {
    // Loader-fired 401: store was already latched before React mounted.
    sessionExpiredStore.notify()

    renderProviders()

    expect(screen.getByText('Session expired')).toBeDefined()
  })

  test('clears the latch when the popup posts AUTH_SUCCESS_MESSAGE', async () => {
    sessionExpiredStore.notify()
    renderProviders()
    expect(screen.getByText('Session expired')).toBeDefined()

    // Simulate the popup landing on `/auth-success` and posting back.
    window.dispatchEvent(
      new MessageEvent('message', {
        data: AUTH_SUCCESS_MESSAGE,
        origin: window.location.origin,
      })
    )

    await waitFor(() => {
      expect(sessionExpiredStore.getSnapshot()).toBe(false)
    })
    expect(screen.queryByText('Session expired')).toBeNull()
  })

  test('ignores AUTH_SUCCESS_MESSAGE from a foreign origin', async () => {
    sessionExpiredStore.notify()
    renderProviders()

    window.dispatchEvent(
      new MessageEvent('message', {
        data: AUTH_SUCCESS_MESSAGE,
        origin: 'https://evil.example.com',
      })
    )

    // Give the listener a tick; the dialog must remain open.
    await new Promise((r) => setTimeout(r, 10))
    expect(sessionExpiredStore.getSnapshot()).toBe(true)
    expect(screen.getByText('Session expired')).toBeDefined()
  })

  test('falls back to same-tab redirect when the popup is blocked', async () => {
    const user = userEvent.setup()
    // Simulate popup blocker: window.open returns null.
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    // Stub navigation — jsdom can't navigate.
    const assignSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: assignSpy },
      writable: true,
    })

    sessionExpiredStore.notify()
    renderProviders()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(openSpy).toHaveBeenCalledOnce()
    expect(assignSpy).toHaveBeenCalledOnce()
    expect(assignSpy.mock.calls[0]?.[0]).toMatch(/\/oauth2\/sign_in/)
  })
})
