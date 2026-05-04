/**
 * Single QueryClient instance for the app. Defaults are conservative:
 * - retry once on transient failures, but not on 401/403/404 (4xx user errors).
 * - 30s staleTime keeps the UI snappy without hammering the API on every focus.
 *
 * Mutation invalidation and toast notifications are centralised: any
 * mutation that declares
 *   `meta: { invalidates: [...queryKeys] }`
 * triggers an automatic `invalidateQueries` fan-out on success, and any
 * mutation that declares
 *   `meta: { successMessage: '...', errorMessage: '...' }`
 * fires a global toast on the corresponding outcome. Set
 *   `meta: { skipToast: true }`
 * to opt out (useful for optimistic updates that already give visual
 * feedback). Mutations without `meta` invalidate nothing and toast
 * nothing — both are opt-in.
 *
 * Queries can opt into the same toast pipeline with
 *   `meta: { errorMessage: '...' }`
 * which fires only on background refetch failures (initial-load errors
 * are surfaced through the component's `error` state).
 */

import { MutationCache, QueryCache, QueryClient, type QueryKey } from '@tanstack/react-query'
import { telemetry } from '@/shared/platform/telemetry/telemetry'
import { toast } from '@/shared/platform/toast'
import { type ApiError, isApiError } from './ApiError'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidates?: readonly QueryKey[]
      successMessage?: string
      errorMessage?: string
      skipToast?: boolean
    }
    queryMeta: {
      errorMessage?: string
      skipToast?: boolean
    }
  }
}

/**
 * Toasts are for users; trace ids are for engineers. We log the
 * correlation event to telemetry (where engineers look) and keep the
 * toast text human-friendly. Anyone debugging a user-reported failure
 * can match the trace id from the inline `<ErrorPanel>` against this
 * event in App Insights.
 */
const reportToastError = (kind: 'mutation' | 'query', template: string, error: unknown): string => {
  if (isApiError(error)) {
    telemetry.trackEvent('toast.error', {
      kind,
      template,
      traceId: error.traceId,
      errorKind: error.kind,
      ...(error.kind === 'http' ? { status: String(error.status) } : {}),
    })
  }
  return template
}

/**
 * 401s are handled out-of-band by `SessionExpiredDialog` (which listens
 * for `SESSION_EXPIRED_EVENT` dispatched from `httpClient`). Showing a
 * toast on top of the dialog would be noise, so suppress it here.
 */
const isHandledOutOfBand = (error: unknown): boolean =>
  isApiError(error) && error.kind === 'http' && error.status === 401

const mutationCache: MutationCache = new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) => {
    const meta = mutation.meta
    if (meta?.successMessage && !meta.skipToast) {
      toast.success(meta.successMessage)
    }
    const invalidates = meta?.invalidates
    if (!invalidates?.length) return
    return Promise.all(invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
  },
  onError: (error, _variables, _context, mutation) => {
    const meta = mutation.meta
    if (!meta?.errorMessage || meta.skipToast) return
    if (isHandledOutOfBand(error)) return
    toast.error(reportToastError('mutation', meta.errorMessage, error))
  },
})

/**
 * Background query failures (refetches, polling) are otherwise silent.
 * Opt a query in by declaring `meta: { errorMessage: '...' }` on its
 * `queryOptions` factory. Initial-load errors should still be surfaced
 * via the component's `error` state — this is a safety net for refetches
 * the user didn't trigger.
 */
const queryCache: QueryCache = new QueryCache({
  onError: (error, query) => {
    const meta = query.meta
    if (!meta?.errorMessage || meta.skipToast) return
    if (isHandledOutOfBand(error)) return
    // Only toast when there is already cached data — i.e. a *refetch*
    // failed. The first load surfaces the error through the component.
    if (query.state.data === undefined) return
    toast.error(reportToastError('query', meta.errorMessage, error))
  },
})

export const queryClient: QueryClient = new QueryClient({
  mutationCache,
  queryCache,
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (isApiError(error) && error.kind === 'http') {
          if (error.status === 401 || error.status === 403 || error.status === 404) {
            return false
          }
        }
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
