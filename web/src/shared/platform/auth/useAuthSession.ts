/**
 * Hook-shaped surface over the OAuth SDK. The only file outside
 * `AuthProvider`/`AuthTokenSync` that touches `react-oauth2-code-pkce`.
 *
 * When auth is disabled (`VITE_AUTH != '1'`) the SDK isn't mounted, so
 * we return a stable "always-authenticated, never-loading" session.
 * Components can branch on these flags without caring which mode is on.
 */

import { useContext } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { ENV } from '@/config/env'

export type AuthSession = {
  token: string | null
  error: string | null
  loginInProgress: boolean
  isAuthenticated: boolean
  /** Display name resolved from the ID token. Null when auth is disabled. */
  username: string | null
  logIn: () => void
  logOut: () => void
}

const NOOP_SESSION: AuthSession = {
  token: null,
  error: null,
  loginInProgress: false,
  isAuthenticated: true,
  username: null,
  logIn: () => {},
  logOut: () => {},
}

export const useAuthSession = (): AuthSession => {
  const ctx = useContext(AuthContext)
  if (!ENV.authEnabled) return NOOP_SESSION
  // `unique_name` is Azure AD-specific. Other OAuth providers expose the
  // display name under different claims — adjust here if you swap IdP.
  const username = (ctx.tokenData?.unique_name as string | undefined) ?? null
  return {
    token: ctx.token ?? null,
    error: ctx.error ?? null,
    loginInProgress: Boolean(ctx.loginInProgress),
    isAuthenticated: Boolean(ctx.token),
    username,
    logIn: () => ctx.logIn(),
    logOut: () => ctx.logOut(),
  }
}
