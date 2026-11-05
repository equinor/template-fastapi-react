// Public types for the api platform module.

// Single funnel for outbound HTTP errors. Every failure (network /
// non-2xx / parse) is normalised into one of these three shapes,
// carrying a traceId for log correlation.
export type { ApiError } from '@team-hermes/react-components'

export type NotificationSource = 'mutation' | 'query'

export interface QueryNotifier {
  success: (message: string) => void
  error: (message: string, context: { error: unknown; source: NotificationSource }) => void
}

export interface CreateQueryClientOptions {
  // How to surface success/error messages declared in mutation/query `meta`.
  notifier?: QueryNotifier
  // Return `true` to suppress the default error notification for a given
  // error. Used to keep notifications from stacking on top of out-of-band
  // UI such as a session-expired dialog or a global error page.
  suppressNotification?: (error: unknown) => boolean
}
