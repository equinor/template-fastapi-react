/**
 * Centralised, typed view of `import.meta.env` values the app cares about.
 *
 * Read env vars only here — everything else imports from `@/config/env`.
 * Vite inlines `import.meta.env.*` at build time, so this is a static
 * snapshot, not a live read.
 */

import { isTelemetryProvider, TelemetryProvider } from '@/shared/platform/telemetry/provider'

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

const trim = (v: string) => v.trim()

const env = import.meta.env

export const ENV = {
  isDev: Boolean(env.DEV),
  isProd: Boolean(env.PROD),

  // --- auth -------------------------------------------------------------
  authEnabled: env.VITE_AUTH === '1',
  authClientId: str(env.VITE_AUTH_CLIENT_ID),
  authAuthorizeEndpoint: str(env.VITE_AUTH_ENDPOINT),
  authTokenEndpoint: str(env.VITE_TOKEN_ENDPOINT),
  authLogoutEndpoint: str(env.VITE_LOGOUT_ENDPOINT),
  authScope: str(env.VITE_AUTH_SCOPE),
  authRedirectUri: str(env.VITE_AUTH_REDIRECT_URI),

  // --- telemetry --------------------------------------------------------
  /**
   * `'appinsights'` → ship to Azure Application Insights (requires
   *   `VITE_APPINSIGHTS_CONNECTION_STRING`; falls back to `'console'`
   *   with a warning if missing).
   * `'console'`     → log to devtools console.
   * `'none'`        → no-op.
   * Default: `'console'` in dev, `'none'` in prod.
   */
  telemetryProvider: ((): TelemetryProvider => {
    const raw = trim(str(env.VITE_TELEMETRY)).toLowerCase()
    if (isTelemetryProvider(raw)) return raw
    return env.DEV ? TelemetryProvider.Console : TelemetryProvider.None
  })(),
  appInsightsConnectionString: trim(str(env.VITE_APPINSIGHTS_CONNECTION_STRING)),

  /**
   * Optional same-origin proxy path for App Insights ingestion (e.g.
   * `/api/monitoring`). When set, the SDK posts telemetry to
   * `<path>/track` instead of Microsoft's public ingestion endpoint —
   * useful when the backend forwards events itself (avoids ad-blockers,
   * keeps PII inside the deployment, single egress point). The
   * connection string's instrumentation key is then irrelevant; any
   * placeholder works.
   */
  appInsightsProxyPath: trim(str(env.VITE_APPINSIGHTS_PROXY_PATH)),

  // --- repo / version ---------------------------------------------------
  /**
   * Base URL of the source repository, used by `<VersionText>` to link a
   * commit hash. Override with `VITE_REPO_URL` when forking this template.
   */
  repoUrl: trim(str(env.VITE_REPO_URL)) || 'https://github.com/equinor/template-fastapi-react',
} as const

export type AppEnv = typeof ENV
