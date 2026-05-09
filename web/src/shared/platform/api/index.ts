// Public barrel. `httpClient` is internal (wired into the generated SDK
// by `configureApiClient`); do not import it directly. Deep imports are
// blocked by ESLint (see `no-restricted-imports` in eslint.config.mts).
//
// Note: `sessionExpiredStore` lives in `auth/reauth/` — it's an auth
// concern that `configureApiClient` happens to write to.
export { isApiError } from './ApiError'
export { configureApiClient } from './configureApiClient'
export { createBaseQueryClient, noopNotifier } from './createBaseQueryClient'
export type { ApiError, CreateQueryClientOptions, NotificationSource, QueryNotifier } from './types'
