/**
 * Neutral telemetry API. The active backend is chosen at module load by
 * `ENV.telemetryProvider` (see `@/config/env`):
 *
 *   - `'appinsights'` → Azure Application Insights. Requires
 *     `VITE_APPINSIGHTS_CONNECTION_STRING`; if missing, falls back to
 *     console with a one-time warning so the app still runs.
 *   - `'console'`     → `console.*` (dev default).
 *   - `'none'`        → no-op.
 *
 * The `Telemetry` interface is the contract every consumer relies on —
 * keep it small and stable. Add a backend by adding a factory under
 * `./backends/` and wiring it into the switch below.
 */

import { ENV } from '@/config/env'
import { createAppInsightsTelemetry } from './backends/appinsights'
import { createConsoleTelemetry } from './backends/console'
import { createNoopTelemetry } from './backends/noop'
import { TelemetryProvider } from './provider'

export { isTelemetryProvider, TelemetryProvider } from './provider'

export type Telemetry = {
  trackException: (err: unknown, ctx?: Record<string, unknown>) => void
  trackEvent: (name: string, props?: Record<string, unknown>) => void
  setUser: (id: string | null) => void
}

/**
 * Compile-time exhaustiveness guard — fails to typecheck if a new
 * `TelemetryProvider` value is added without a matching `case` below.
 */
const assertNever = (x: never): never => {
  throw new Error(`Unhandled telemetry provider: ${String(x)}`)
}

/**
 * Build the active telemetry backend. Pure — exported so tests can drive
 * the selection logic without observing the module-load singleton below.
 * `backends` is injectable so tests can pass spies; production callers
 * use the default which wires in the real factories.
 */
export type TelemetryBackends = {
  appInsights: (connectionString: string, proxyPath?: string) => Telemetry
  console: () => Telemetry
  noop: () => Telemetry
}

const defaultBackends: TelemetryBackends = {
  appInsights: createAppInsightsTelemetry,
  console: createConsoleTelemetry,
  noop: createNoopTelemetry,
}

export const selectTelemetry = (
  provider: TelemetryProvider,
  appInsightsConnectionString: string,
  backends: TelemetryBackends = defaultBackends,
  appInsightsProxyPath = ''
): Telemetry => {
  switch (provider) {
    case TelemetryProvider.AppInsights: {
      if (!appInsightsConnectionString) {
        // Surface in dev console; in prod this typically goes unseen, so
        // the connection string should also be validated at deploy time.
        console.warn(
          '[telemetry] VITE_TELEMETRY=appinsights but VITE_APPINSIGHTS_CONNECTION_STRING is empty — falling back to console.'
        )
        return backends.console()
      }
      return backends.appInsights(appInsightsConnectionString, appInsightsProxyPath || undefined)
    }
    case TelemetryProvider.Console:
      return backends.console()
    case TelemetryProvider.None:
      return backends.noop()
    default:
      return assertNever(provider)
  }
}

export const telemetry: Telemetry = selectTelemetry(
  ENV.telemetryProvider,
  ENV.appInsightsConnectionString,
  defaultBackends,
  ENV.appInsightsProxyPath
)
