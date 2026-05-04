// App-wide `QueryClient` factory. The only place that couples the data
// layer to UI concerns (toast) and observability (telemetry). Templates
// that want a different notification surface — a banner, Sentry
// breadcrumbs, nothing at all — should fork *this* file and leave
// `shared/platform/api/createBaseQueryClient.ts` untouched.

import { createBaseQueryClient, isApiError, type QueryNotifier } from '@/shared/platform/api'
import type { Telemetry } from '@/shared/platform/telemetry'
import { toast } from '@/shared/platform/toast'

// 401s are handled out-of-band by `SessionExpiredDialog` (which listens
// for the `sessionExpiredStore` flag latched by `httpClient`). A toast
// on top of the dialog would be noise.
const isSessionExpired = (error: unknown): boolean =>
  isApiError(error) && error.kind === 'http' && error.status === 401

export const createQueryClient = ({ telemetry }: { telemetry: Telemetry }) => {
  const toastNotifier: QueryNotifier = {
    success: toast.success,
    error: (message, { error, source }) => {
      // Toasts are for users; trace ids and error details are for
      // engineers. Log a correlation event to telemetry where engineers
      // look, and keep the toast text human-friendly. Anyone debugging
      // a user-reported failure can match the trace id from the inline
      // `<ErrorPanel>` against this event in App Insights.
      if (isApiError(error)) {
        telemetry.trackEvent('toast.error', {
          kind: source,
          template: message,
          traceId: error.traceId,
          errorKind: error.kind,
          ...(error.kind === 'http' ? { status: String(error.status) } : {}),
        })
      } else {
        telemetry.trackEvent('toast.error', {
          kind: source,
          template: message,
          errorKind: 'unknown',
          message: error instanceof Error ? error.message : String(error),
        })
      }
      toast.error(message)
    },
  }

  return createBaseQueryClient({
    notifier: toastNotifier,
    suppressNotification: isSessionExpired,
  })
}
