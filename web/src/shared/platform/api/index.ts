// Public barrel. `httpClient` is internal (wired into the generated SDK
// by `configureApiClient`); do not import it directly. Deep imports are
// blocked by Oxlint (see `no-restricted-imports` in vite.config.ts).
//
// Note: `sessionExpiredStore` lives in `auth/reauth/` — it's an auth
// concern that `configureApiClient` happens to write to.
export { isApiError } from './ApiError'
export { configureApiClient } from './configureApiClient'
export { createBaseQueryClient, noopNotifier } from './createBaseQueryClient'
export type { ApiError, CreateQueryClientOptions, NotificationSource, QueryNotifier } from './types'
