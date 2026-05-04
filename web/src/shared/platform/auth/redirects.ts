/**
 * BFF redirect helpers for sign-in / sign-out via oauth2-proxy.
 *
 * `withRedirect` enforces a same-origin absolute path so a future caller
 * cannot accidentally turn this into an open redirect.
 */

import type { Telemetry } from '@/shared/platform/telemetry'

const withRedirect = (path: string): string => {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error(`withRedirect: path must be a same-origin absolute path, got ${path}`)
  }
  const rd = window.location.pathname + window.location.search + window.location.hash
  return `${path}?rd=${encodeURIComponent(rd)}`
}

export const signIn = (): void => {
  window.location.assign(withRedirect('/oauth2/sign_in'))
}

export const signOut = (telemetry: Telemetry): void => {
  // Clear the AI authenticated-user cookie before navigating so a fresh
  // login session doesn't inherit the previous user's `ai_user` cookie
  // across the sign-out gap.
  telemetry.setUser(null)
  window.location.assign(withRedirect('/oauth2/sign_out'))
}
