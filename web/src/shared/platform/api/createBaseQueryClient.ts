// Pure factory for the base `QueryClient`. Holds cross-cutting
// mutation/query behaviour (invalidation, success/error notifications,
// retry policy) but knows nothing about *how* notifications are
// delivered — that's injected via `notifier`.
//
// The app boundary wraps this in `app/bootstrap/createQueryClient.ts` to inject a
// toast-backed notifier and a 401 suppression rule. Tests/Storybook can
// import this directly with `noopNotifier`.
//
// Retry policy:
//   - Queries retry once, except for 401/403/404 (auth/permission/missing
//     won't fix themselves). See `NON_RETRYABLE_STATUSES`.
//   - Mutations never retry. They are side-effectful (POST/PUT/PATCH/DELETE)
//     and may not be idempotent; retrying could double-create or double-charge.
//     Per-mutation overrides should be rare and explicit.
//
// Mutation `meta`:
//   `invalidates: [...queryKeys]`  → fan-out invalidate on success
//   `successMessage: '...'`        → notifier.success on success
//   `errorMessage: '...'`          → notifier.error on failure
//   `skipNotification: true`       → opt out of notifications
//
// Query `meta`:
//   `errorMessage: '...'`          → notifier.error on *refetch* failure
//                                    (initial-load errors are surfaced via
//                                    the component's `error` state)
//   `skipNotification: true`       → opt out
//
// Mutations/queries without `meta` invalidate nothing and notify
// nothing — both are opt-in.

import { MutationCache, QueryCache, QueryClient, type QueryKey } from '@tanstack/react-query'
import { isApiError } from './ApiError'
import type { CreateQueryClientOptions, QueryNotifier } from './types'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidates?: readonly QueryKey[]
      successMessage?: string
      errorMessage?: string
      skipNotification?: boolean
    }
    queryMeta: {
      errorMessage?: string
      skipNotification?: boolean
    }
  }
}

// No-op notifier; useful for tests, Storybook, or apps that don't want UI notifications.
export const noopNotifier: QueryNotifier = {
  success: () => {},
  error: () => {},
}

const DEFAULT_STALE_TIME_MS = 30_000
const MAX_QUERY_RETRIES = 1
// HTTP statuses where retrying is pointless: auth/permission/missing won't fix themselves.
const NON_RETRYABLE_STATUSES = new Set([401, 403, 404])

export const createBaseQueryClient = ({
  notifier = noopNotifier,
  suppressNotification,
}: CreateQueryClientOptions = {}): QueryClient => {
  const isSuppressed = (error: unknown): boolean => suppressNotification?.(error) ?? false

  // Both caches close over `client` lazily — `onSuccess`/`onError` only
  // fire after `client` is assigned below, so the forward reference is
  // safe despite reading like a TDZ trap.
  const mutationCache = new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const { successMessage, skipNotification, invalidates } = mutation.meta ?? {}
      if (successMessage && !skipNotification) notifier.success(successMessage)
      return invalidates?.length
        ? Promise.all(invalidates.map((queryKey) => client.invalidateQueries({ queryKey })))
        : undefined
    },
    onError: (error, _variables, _context, mutation) => {
      const { errorMessage, skipNotification } = mutation.meta ?? {}
      if (!errorMessage || skipNotification) return
      if (isSuppressed(error)) return
      notifier.error(errorMessage, { error, source: 'mutation' })
    },
  })

  const queryCache = new QueryCache({
    onError: (error, query) => {
      const { errorMessage, skipNotification } = query.meta ?? {}
      if (!errorMessage || skipNotification) return
      if (isSuppressed(error)) return
      // Only notify when there is already cached data — i.e. a *refetch*
      // failed. The first load surfaces the error through the component.
      if (query.state.data === undefined) return
      notifier.error(errorMessage, { error, source: 'query' })
    },
  })

  const client: QueryClient = new QueryClient({
    mutationCache,
    queryCache,
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        retry: (failureCount, error) => {
          if (isApiError(error) && error.kind === 'http' && NON_RETRYABLE_STATUSES.has(error.status)) {
            return false
          }
          return failureCount < MAX_QUERY_RETRIES
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Mutations are side-effectful and may not be idempotent;
        // retrying could double-create / double-charge. Opt in per
        // call site (`useMutation({ retry: ... })`) only when the
        // endpoint is provably safe to replay. The `NON_RETRYABLE_STATUSES`
        // filter on queries is irrelevant here because we never retry.
        retry: false,
      },
    },
  })

  return client
}
