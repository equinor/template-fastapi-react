# telemetry

Neutral telemetry surface for the SPA. Three concerns: errors (`trackException`),
events (`trackEvent`), and identity (`setUser`).

## Boot

```ts
// src/index.tsx
import { createTelemetry, registerGlobalErrorHandlers } from '@/shared/platform/telemetry'
import { ENV } from '@/config/env'

const telemetry = createTelemetry(ENV.telemetryBackend)
registerGlobalErrorHandlers(telemetry)
```

`telemetry` is then injected into:
- `<TelemetryProvider>` for React consumers
- `<TelemetryErrorBoundary>` to catch render/commit errors
- function arguments for non-React code (e.g. `configureApiClient({ telemetry })`)

## Use it

```tsx
// React
const telemetry = useTelemetry()
telemetry.trackEvent('todo.created', { id })

// Non-React (pass telemetry as an argument; do not import a singleton)
const handle = (telemetry: Telemetry) => telemetry.trackException(err, { url })
```

## Backends

Selected via `VITE_TELEMETRY` (parsed in `@/config/env`):

| Value          | Behaviour                                                     |
|----------------|---------------------------------------------------------------|
| `appinsights`  | Azure Application Insights via the BFF at `/api/monitoring/`  |
| `console`      | `console.*` (dev default)                                     |
| `none`         | no-op (prod default)                                          |

App Insights ingestion is proxied through the BFF — no connection string or
instrumentation key in the SPA. Page views use `enableAutoRouteTracking`.

## Add a backend

1. Create `backends/<name>.ts` exporting `create<Name>Telemetry(): Telemetry`.
2. Add the identifier to `backend.ts` (`TelemetryBackend`).
3. Add a `case` in [createTelemetry.ts](createTelemetry.ts).

## Files

- [createTelemetry.ts](createTelemetry.ts) — backend factory dispatcher
- [backend.ts](backend.ts) — backend identifier enum + type guard
- [types.ts](types.ts) — `Telemetry` contract
- [TelemetryContext.tsx](TelemetryContext.tsx) — React provider + `useTelemetry` hook
- [TelemetryErrorBoundary.tsx](TelemetryErrorBoundary.tsx) — outermost render-error boundary
- [registerGlobalErrorHandlers.ts](registerGlobalErrorHandlers.ts) — `window` listeners for unhandled rejections / errors
- [backends/](backends/) — backend implementations

## Design

Pure module — no module-level state, no singleton. The composition root creates
exactly one instance and propagates it. Errors should reach App Insights exactly
once: render errors via `TelemetryErrorBoundary`, escapes via
`registerGlobalErrorHandlers`, HTTP failures as low-noise `http.error` events
(see `shared/platform/api/configureApiClient.ts`).
