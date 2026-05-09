/**
 * Auth platform — neutral surface in front of the BFF (oauth2-proxy).
 *
 * Swap MSAL/Auth0 in by editing the modules in this folder plus
 * `useCurrentUser`, and mount the SDK's provider in `AppProviders.tsx`.
 */

// Identity
export type { CurrentUser } from './currentUser'
// Re-auth (UI-facing surface; flow lives in ./reauth)
export { AUTH_SUCCESS_MESSAGE, sessionExpiredStore, useAuthSuccessHandshake, useReauthFlow } from './reauth'

// Sign in / out
export { signIn } from './redirects'
export { startSessionWatcher } from './sessionWatcher'
export { useCurrentUser } from './useCurrentUser'
export { getCurrentUser, userQuery } from './userQuery'
export { useSignOut } from './useSignOut'

// Telemetry bridge
