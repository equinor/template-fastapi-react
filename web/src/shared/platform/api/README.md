# API platform module

The HTTP + data-fetching boundary. Centralises three concerns:

1. **Error normalisation** — every outbound HTTP failure becomes a
   typed `ApiError` (`network` | `http` | `parse`) carrying a
   `traceId` for log correlation.
2. **Fetch funnel** — a single `fetch` wrapper installed onto the
   generated SDK adds tracing, timeouts, 401 latching, and telemetry.
3. **TanStack Query base** — opt-in mutation/query `meta` for
   invalidation and notifications, with a pluggable `notifier`.

Auth is handled out of process by oauth2-proxy (HttpOnly cookie). No
bearer tokens are touched in JS.

## Files

| File | Purpose |
|---|---|
| `types.ts` | Public types: `ApiError`, `QueryNotifier`, `NotificationSource`, `CreateQueryClientOptions`. |
| `ApiError.ts` | `isApiError` runtime guard. |
| `configureApiClient.ts` | Installs the shared `fetch` funnel onto the generated SDK. |
| `createBaseQueryClient.ts` | Pure `QueryClient` factory + `noopNotifier`. |
| `index.ts` | Public barrel (deep imports blocked by ESLint). |

## Wiring

`configureApiClient` runs once at boot, before the router is built:

```ts
// src/index.tsx
const telemetry = createTelemetry(/* … */)
configureApiClient({ telemetry })
const queryClient = createQueryClient({ /* notifier, suppressNotification */ })
```

Tests do the same in `setupTests.ts` (MSW handlers are registered
against `http://localhost`, no `/api` prefix).

## ApiError

```ts
type ApiError =
  | { kind: 'network'; traceId: string; message: string }
  | { kind: 'http'; status: number; traceId: string; message: string }
  | { kind: 'parse'; traceId: string; message: string }
```

- `network` — fetch rejected (offline, DNS, timeout, abort).
- `http` — non-2xx response. `status` is set; `message` defaults to
  `statusText` or `HTTP <status>`.
- `parse` — 2xx but the response wasn't JSON (typically the SPA
  fallback returning `text/html` because the proxy is misconfigured).

Use `isApiError(e)` in catch sites and error boundaries. Components
that render an error pane should narrow on `kind` for messaging.

## Telemetry

Failed requests emit a low-noise `http.error` event with
`{ kind, traceId, status?, url, reason? }`. They do **not** trigger
exception telemetry — exceptions are reserved for the route boundary
and the top-level React error boundary, so a single user-visible
failure shows up exactly once in App Insights.

## 401 handling

A 401 latches `sessionExpiredStore` so `<SessionExpiredDialog>` can
react even when the 401 originated from a route loader running before
React mounted. The error itself still propagates as an
`ApiError({ kind: 'http', status: 401 })`.

## Timeouts

Every request gets a 30s `AbortSignal.timeout`. Caller-provided
signals are composed via `AbortSignal.any` — whichever aborts first
wins. For legitimately slow calls, pass a custom `init.signal`.

## QueryClient meta

The base `QueryClient` reads opt-in `meta` for cross-cutting behaviour.

**Mutations:**

```ts
useMutation({
  mutationFn: createTodo,
  meta: {
    invalidates: [todoKeys.all],
    successMessage: 'Todo created',
    errorMessage: 'Could not create todo',
    // skipNotification: true,
  },
})
```

**Queries:**

```ts
useQuery({
  queryKey: todoKeys.list(),
  queryFn: fetchTodos,
  meta: {
    errorMessage: 'Could not refresh todos',  // shown only on REFETCH failure
    // skipNotification: true,
  },
})
```

Without `meta`, nothing fires. Initial-load query errors surface via
the component's `error` state, not the notifier.

## Retry policy

- Queries retry once except on `401`, `403`, `404` (no point).
- Mutations never retry.
- `staleTime` defaults to 30s; `refetchOnWindowFocus` is off.

## Notifier

`QueryNotifier` is the seam between the QueryClient and the UI:

```ts
interface QueryNotifier {
  success: (message: string) => void
  error: (message: string, ctx: { error: unknown; source: 'mutation' | 'query' }) => void
}
```

The app injects a toast-backed notifier and a `suppressNotification`
predicate (e.g. swallow 401s while the session-expired dialog is open).
Tests/Storybook can use `noopNotifier`.

## Adding behaviour

- New cross-cutting `meta` field → extend the `Register` declaration
  in `createBaseQueryClient.ts` and read it in the cache callbacks.
- New error kind → widen `ApiError` in `types.ts` and detect the
  condition in `configureApiClient.ts`'s fetch wrapper.
