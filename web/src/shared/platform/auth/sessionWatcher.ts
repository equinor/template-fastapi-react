/**
 * Re-checks `/whoami` when the tab regains focus or the network comes
 * back online. If the session expired while the user was away, the
 * fetch 401s, `httpClient` latches `sessionExpiredStore`, and the dialog
 * appears over the user's current page — no navigation, no blank screen,
 * the user picks up where they left off after re-auth.
 *
 * Module-level (not a React effect) so it works even if no component is
 * subscribed to `useCurrentUser()`. Wired up once at app init from
 * `AppProviders.tsx`.
 *
 * Idempotent: subsequent calls return the *same* disposer until it has
 * actually run, so React StrictMode's double-invoke and any re-mount of
 * `AppProviders` cannot leak duplicate listeners. The disposer itself
 * is also idempotent — only the first invocation detaches.
 */

import type { QueryClient } from '@tanstack/react-query'
import { ENV } from '@/config/env'
import { USER_QUERY_KEY } from './userQuery'

let activeDisposer: (() => void) | null = null

export const startSessionWatcher = (queryClient: QueryClient): (() => void) => {
  if (activeDisposer) return activeDisposer
  if (!ENV.authEnabled || typeof document === 'undefined') return () => {}

  const recheck = () => {
    // `refetchQueries` honours the query's `retry: false` and routes
    // failures through `httpClient` → `sessionExpiredStore`. The catch
    // is purely to suppress unhandled-rejection noise; telemetry is
    // already emitted inside `httpClient`.
    queryClient.refetchQueries({ queryKey: USER_QUERY_KEY }).catch(() => {})
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible') recheck()
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('online', recheck)

  const dispose = () => {
    if (activeDisposer !== dispose) return
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('online', recheck)
    activeDisposer = null
  }
  activeDisposer = dispose
  return dispose
}
