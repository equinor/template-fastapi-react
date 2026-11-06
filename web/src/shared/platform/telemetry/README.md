# Telemetry

The public barrel re-exports `@team-hermes/react-components` telemetry, types,
providers, error boundary, backend guard, and tracking hooks. There are no local
backend implementations. Pass telemetry into non-React code rather than importing
a singleton.

`src/index.tsx` creates one instance from `ENV.telemetryBackend` and puts the
single `TelemetryErrorBoundary` around `Application`, so React render failures
during application initialization reach `ApplicationError`. `Application`
registers global error handlers and the session watcher in an effect, returning
both disposers; HMR unmounts the root.

| `VITE_TELEMETRY` | Backend                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `console`        | Console events, development default                                         |
| `none`           | No-op, production default                                                   |
| `appinsights`    | Lazy Application Insights SDK, same-origin `/api/monitoring/` BFF ingestion |

```tsx
const telemetry = useTelemetry()
telemetry.trackEvent('todo.created', { id })
const trackSave = useTrackEvent('todo.saved')
useTrackMount('todos.opened')
```

HTTP failures still emit `http.error` events from `configureApiClient`; query
notifications emit `toast.error` with the same trace ID shown in Hermes'
`ErrorPanel`. Unexpected non-`ApiError` query/mutation failures also emit
exception telemetry when they produce a toast; expected API failures are not
reported twice. The CSP allows SDK configuration from
`https://js.monitor.azure.com` and same-origin ingestion/dynamic chunks.

**Released 1.11.0 deviation:** Hermes does not disable SDK automatic exception
collection, so global errors can be reported twice alongside
`registerGlobalErrorHandlers`. The contract is retained as an expected-failure
test pending [upstream #93](https://github.com/equinor/team-hermes-packages/pull/93).
Backend changes belong in Hermes, not a local patch.
