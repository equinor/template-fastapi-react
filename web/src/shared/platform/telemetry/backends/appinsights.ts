import { ApplicationInsights, type IExceptionTelemetry } from '@microsoft/applicationinsights-web'
import type { Telemetry } from '../telemetry'

const toError = (err: unknown): Error =>
  err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err))

/**
 * App Insights' SDK is permissive about argument shape but only
 * surfaces custom dimensions reliably when they're nested under
 * `properties`. Shipping `ctx` as a separate positional arg used to
 * "work" but quietly dropped some keys depending on version.
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

export const createAppInsightsTelemetry = (connectionString: string, proxyPath?: string): Telemetry => {
  // Same-origin proxy mode: backend forwards events itself, so the SDK
  // posts to `<proxyPath>/track` instead of Microsoft's public ingestion
  // endpoint. Skips iKey validation because the placeholder key in the
  // connection string is no longer meaningful.
  const proxyConfig = proxyPath
    ? { endpointUrl: `${proxyPath.replace(/\/$/, '')}/track`, disableInstrumentationKeyValidation: true }
    : {}

  const appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: true,
      disableFetchTracking: false,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      ...proxyConfig,
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
