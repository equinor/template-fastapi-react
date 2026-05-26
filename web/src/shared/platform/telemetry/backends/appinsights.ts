import { ReactPlugin } from '@microsoft/applicationinsights-react-js'
import { ApplicationInsights, type IExceptionTelemetry } from '@microsoft/applicationinsights-web'
import type { Telemetry } from '../types'

const toError = (err: unknown): Error =>
  err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err))

/**
 * App Insights only surfaces custom dimensions reliably when nested under
 * `properties`. Stringify non-string values to keep keys intact.
 */
const toProperties = (ctx?: Record<string, unknown>): Record<string, string> | undefined => {
  if (!ctx) return undefined
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(ctx)) {
    if (v == null) continue
    out[k] = typeof v === 'string' ? v : JSON.stringify(v)
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/**
 * Exported so components can use `useTrackEvent` / `useTrackMetric`, or wrap
 * a tree with `<AppInsightsContext.Provider value={reactPlugin}>`. Inert
 * unless the AppInsights backend is selected.
 */
export const reactPlugin = new ReactPlugin()

// SDK requires a parseable connection string. Ingestion is always proxied
// through the BFF — the SDK derives the destination from `IngestionEndpoint`
// (the trailing slash is required; the SDK appends `v2/track`). The iKey is
// meaningless because `disableInstrumentationKeyValidation` is set and the
// BFF replaces it before forwarding to Azure Monitor.
const buildPlaceholderConnectionString = (): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  return `InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=${origin}/api/monitoring/`
}

export const createAppInsightsTelemetry = (): Telemetry => {
  const appInsights = new ApplicationInsights({
    config: {
      connectionString: buildPlaceholderConnectionString(),
      disableInstrumentationKeyValidation: true,
      enableAutoRouteTracking: true,
      disableFetchTracking: false,
      autoTrackPageVisitTime: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      extensions: [reactPlugin],
    },
  })
  appInsights.loadAppInsights()
  appInsights.trackPageView()

  return {
    trackException: (err, ctx) => {
      const payload: IExceptionTelemetry = { exception: toError(err), properties: toProperties(ctx) }
      appInsights.trackException(payload)
    },
    trackEvent: (name, props) => {
      appInsights.trackEvent({ name, properties: toProperties(props) })
    },
    setUser: (id) => {
      if (id) appInsights.setAuthenticatedUserContext(id, undefined, true)
      else appInsights.clearAuthenticatedUserContext()
    },
  }
}
