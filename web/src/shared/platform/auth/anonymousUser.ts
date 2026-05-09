/**
 * Local-dev-only "anonymous" identity, used when `VITE_AUTH` is disabled.
 *
 * Granted `admin` *only* in dev builds so contributors can click around
 * without standing up Entra ID. In production builds
 * (`import.meta.env.DEV === false`) roles are empty: every permission gate
 * denies. This prevents a forked template from accidentally shipping with
 * `VITE_AUTH=0` and full admin access.
 */

import type { CurrentUser } from './currentUser'

export const ANONYMOUS_USER: CurrentUser = {
  id: 'anonymous',
  name: 'Local developer',
  roles: import.meta.env.DEV ? ['admin'] : [],
}
