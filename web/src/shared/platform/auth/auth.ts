import type { TAuthConfig } from 'react-oauth2-code-pkce'
import { ENV } from '@/config/env'
import { telemetry } from '@/shared/platform/telemetry/telemetry'

/**
 * Auth platform — neutral surface; the SDK lives only in this folder.
 *
 * Two responsibilities:
 *   1. Token holder for `httpClient` (synchronous read on every request).
 *   2. `requireAuth()` for route loaders + role list for `accessControl`.
 *
 * The user model is intentionally tiny — id, name, roles. Permissions are
 * derived from roles by `accessControl.ts`. Swap in MSAL or Auth0 by
 * editing only this file and AuthProvider.tsx.
 */

export type CurrentUser = {
  id: string
  name: string
  roles: readonly string[]
}

const hasAuthConfig = ENV.authEnabled

// --- Token holder ----------------------------------------------------------
// `AuthTokenSync` (mounted in AppProviders) keeps this synced from
// react-oauth2-code-pkce so that `httpClient` — which is plain fetch,
// not a hook — can read the current token.
let currentToken: string | null = null

export const setToken = (token: string | null): void => {
  const next = token && token.length > 0 ? token : null
  const wasAuthenticated = currentToken !== null
  currentToken = next
  // Logout transition (had-token → null): clear identity from telemetry
  // and drop the cached user so the next `requireAuth()` re-hydrates.
  // Skip the initial mount case (null → null) so tests that seed a user
  // via `setCurrentUserForTests` keep their state.
  if (next === null && wasAuthenticated) {
    currentUser = null
    pending = null
    telemetry.setUser(null)
  }
}

export const getToken = (): string | null => currentToken

// --- Current user + requireAuth -------------------------------------------
let currentUser: CurrentUser | null = null
let pending: Promise<CurrentUser> | null = null

const ANONYMOUS_USER: CurrentUser = {
  id: 'anonymous',
  name: 'Local developer',
  roles: ['admin'],
}

const hydrateUser = async (): Promise<CurrentUser> => {
  // Without backend auth (AUTH_ENABLED=0), grant the local dev the
  // `admin` role so every gate is open. With auth enabled, derive
  // identity from the bearer token — the template API doesn't expose a
  // `/me` endpoint yet, so we stub a single role here. (A real impl
  // would call `/me` and validate the response shape with Zod.)
  if (!hasAuthConfig) {
    currentUser = ANONYMOUS_USER
    telemetry.setUser(ANONYMOUS_USER.id)
    return ANONYMOUS_USER
  }
  const token = getToken()
  if (!token) {
    throw new Error('requireAuth: no token available; AuthProvider must mount first')
  }
  const user: CurrentUser = {
    id: 'oauth-user',
    name: 'Authenticated user',
    roles: ['admin'],
  }
  currentUser = user
  telemetry.setUser(user.id)
  return user
}

export const requireAuth = async (): Promise<CurrentUser> => {
  if (currentUser) return currentUser
  if (!pending) pending = hydrateUser()
  return pending
}

export const getCurrentUser = (): CurrentUser | null => currentUser

export const setCurrentUserForTests = (user: CurrentUser | null) => {
  currentUser = user
  pending = null
}

// --- OAuth config (consumed by AuthProvider) ------------------------------
export const authConfig: TAuthConfig = {
  clientId: ENV.authClientId,
  authorizationEndpoint: ENV.authAuthorizeEndpoint,
  tokenEndpoint: ENV.authTokenEndpoint,
  scope: ENV.authScope,
  redirectUri: window.origin,
  logoutEndpoint: ENV.authLogoutEndpoint,
  autoLogin: false,
  preLogin: () =>
    localStorage.setItem(
      'preLoginPath',
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    ),
  postLogin: () => window.location.replace(localStorage.getItem('preLoginPath') ?? ENV.authRedirectUri),
}
