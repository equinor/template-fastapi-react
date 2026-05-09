/**
 * The user identity query — single source of truth for "who is logged in".
 *
 * Identity comes from the FastAPI `/whoami` endpoint (auth-gated by
 * `auth_with_jwt`). The browser holds no access token; auth flows via
 * the HttpOnly session cookie set by oauth2-proxy. The generated SDK
 * routes through `httpClient`, so a 401 still latches
 * `sessionExpiredStore` for `<SessionExpiredDialog>` exactly as before.
 *
 * Role mapping (IdP claims → SPA roles) lives server-side in
 * `auth_with_jwt`; the SPA just consumes whatever `roles` the backend
 * returns. Unknown role names are harmless — `accessControl.ts` simply
 * won't find a permission entry for them.
 *
 * The query is pure data: telemetry's `setUser` side-effect lives in
 * `useTelemetryUserSync`, mounted from `AppProviders`, so this module
 * has no telemetry dependency.
 */

import { type QueryClient, queryOptions } from '@tanstack/react-query'
import { whoami } from '@/api-generated'
import { ENV } from '@/config/env'
import { ANONYMOUS_USER } from './anonymousUser'
import type { CurrentUser } from './currentUser'

export const USER_QUERY_KEY = ['auth', 'user'] as const

const fetchCurrentUser = async (signal?: AbortSignal): Promise<CurrentUser> => {
  // When auth is disabled (`VITE_AUTH != '1'`), don't hit the backend —
  // the SPA may be running standalone (no nginx/oauth2 in front).
  if (!ENV.authEnabled) {
    return ANONYMOUS_USER
  }
  const { data } = await whoami({ signal, throwOnError: true })
  return {
    id: data.user_id,
    name: data.full_name ?? data.email ?? data.user_id,
    roles: data.roles ?? [],
  }
}

export const userQuery = () =>
  queryOptions({
    queryKey: USER_QUERY_KEY,
    queryFn: ({ signal }) => fetchCurrentUser(signal),
    staleTime: 5 * 60 * 1000,
    retry: false,
    meta: { skipNotification: true },
  })

/**
 * Synchronous read of the cached user. Returns `null` until the query
 * has resolved (or has been seeded). Pass a `QueryClient` (e.g. from
 * `useQueryClient()` in React, or from a route loader). Prefer
 * `useCurrentUser()` for components that should re-render on change.
 */
export const getCurrentUser = (queryClient: QueryClient): CurrentUser | null =>
  queryClient.getQueryData<CurrentUser>(USER_QUERY_KEY) ?? null
