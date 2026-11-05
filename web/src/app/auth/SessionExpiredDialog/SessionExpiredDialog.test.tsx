/**
 * SessionExpiredDialog reads `sessionExpiredStore` (latched by
 * `httpClient` on 401). Tests cover both directions:
 *   1. store is notified → dialog opens
 *   2. popup posts AUTH_SUCCESS_MESSAGE → store is cleared
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { createQueryClient } from '@/app/bootstrap/createQueryClient'
import { Providers } from '@/app/bootstrap/Providers'
import { AUTH_SUCCESS_MESSAGE, sessionExpiredStore } from '@/shared/platform/auth'
import { createTelemetry, TelemetryBackend } from '@/shared/platform/telemetry'

const telemetry = createTelemetry(TelemetryBackend.None)
const renderProviders = (onReauthenticated = vi.fn()) => {
  const queryClient = createQueryClient({ telemetry, toast: { success: vi.fn(), error: vi.fn() } })
  render(
    <Providers queryClient={queryClient} telemetry={telemetry} onReauthenticated={onReauthenticated}>
      {null}
    </Providers>
  )
  return { queryClient, onReauthenticated }
}

const notifyAuthSuccess = () =>
  act(async () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: AUTH_SUCCESS_MESSAGE,
        origin: window.location.origin,
      })
    )
  })

const openPopup = () => {
  const popup = { closed: false, close: vi.fn() }
  vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window)
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
  return popup
}

afterEach(() => {
  vi.useRealTimers()
  act(() => sessionExpiredStore._reset())
  vi.restoreAllMocks()
})

describe('SessionExpiredDialog', () => {
  test('opens when the session-expired store is notified', async () => {
    renderProviders()

    expect(screen.queryByText('Session expired')).toBeNull()

    act(() => sessionExpiredStore.notify())

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

  test('verifies a fresh session before dismissing the dialog and retrying the page', async () => {
    sessionExpiredStore.notify()
    const { queryClient, onReauthenticated } = renderProviders()
    const fetchUser = vi.spyOn(queryClient, 'fetchQuery')
    expect(screen.getByText('Session expired')).toBeDefined()

    // Simulate the popup landing on `/auth-success` and posting back.
    await notifyAuthSuccess()

    await waitFor(() => {
      expect(sessionExpiredStore.getSnapshot()).toBe(false)
    })
    expect(screen.queryByText('Session expired')).toBeNull()
    expect(fetchUser).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['auth', 'user'], staleTime: 0 }))
    expect(onReauthenticated).toHaveBeenCalledOnce()
  })

  test('keeps the dialog open when session verification fails, without retrying the page', async () => {
    sessionExpiredStore.notify()
    const { queryClient, onReauthenticated } = renderProviders()
    const fetchUser = vi.spyOn(queryClient, 'fetchQuery').mockRejectedValueOnce(new Error('Still signed out'))

    await notifyAuthSuccess()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not complete sign-in. Please try again.')
    expect(sessionExpiredStore.getSnapshot()).toBe(true)
    expect(onReauthenticated).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()

    await notifyAuthSuccess()

    await waitFor(() => expect(onReauthenticated).toHaveBeenCalledOnce())
    expect(fetchUser).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('Session expired')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('shows an error and reopens the dialog if resuming the page fails', async () => {
    sessionExpiredStore.notify()
    const onReauthenticated = vi.fn().mockRejectedValueOnce(new Error('Could not reload the route'))
    renderProviders(onReauthenticated)

    await notifyAuthSuccess()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not complete sign-in. Please try again.')
    expect(sessionExpiredStore.getSnapshot()).toBe(true)
    expect(onReauthenticated).toHaveBeenCalledOnce()
  })

  test('re-enables sign-in when the popup is closed without signing in', async () => {
    vi.useFakeTimers()
    sessionExpiredStore.notify()
    renderProviders()

    const popup = openPopup()
    expect(screen.getByRole('button', { name: 'Waiting for sign-in…' })).toBeDisabled()

    await act(() => vi.advanceTimersByTimeAsync(5000))
    expect(screen.getByRole('button', { name: 'Waiting for sign-in…' })).toBeDisabled()

    popup.closed = true
    await act(() => vi.advanceTimersByTimeAsync(5000))

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    expect(sessionExpiredStore.getSnapshot()).toBe(true)
  })

  test('keeps waiting when the popup closes itself right after the handshake', async () => {
    vi.useFakeTimers()
    sessionExpiredStore.notify()
    const { queryClient, onReauthenticated } = renderProviders()
    const fetchQuery = queryClient.fetchQuery.bind(queryClient)
    let finishVerification = () => {}
    const verified = new Promise<void>((resolve) => {
      finishVerification = resolve
    })
    vi.spyOn(queryClient, 'fetchQuery').mockImplementationOnce(async (options) => {
      await verified
      return fetchQuery(options)
    })

    const popup = openPopup()
    popup.closed = true
    // The close is noticed before the handshake message arrives.
    await act(() => vi.advanceTimersByTimeAsync(600))
    await notifyAuthSuccess()
    await act(() => vi.advanceTimersByTimeAsync(5000))

    expect(screen.getByRole('button', { name: 'Waiting for sign-in…' })).toBeDisabled()
    expect(screen.queryByRole('alert')).toBeNull()

    finishVerification()
    await act(() => vi.advanceTimersByTimeAsync(100))

    expect(onReauthenticated).toHaveBeenCalledOnce()
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
