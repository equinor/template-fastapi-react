/**
 * Centralised, typed view of `import.meta.env` values the app cares about.
 *
 * Read env vars only here — everything else imports from `@/config/env`.
 * Vite inlines `import.meta.env.*` at build time, so this is a static
 * snapshot, not a live read.
 */

import { isTelemetryBackend, TelemetryBackend } from '@/shared/platform/telemetry'

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

const trim = (v: string) => v.trim()

const env = import.meta.env

export const ENV = {
  isDev: Boolean(env.DEV),
  isProd: Boolean(env.PROD),

  // --- auth -------------------------------------------------------------
  // The BFF (oauth2-proxy + nginx) terminates user authentication at the
  // edge and exposes `/whoami` (via the FastAPI backend) for identity.
  // The SPA only needs a kill-switch: when `VITE_AUTH != '1'` it skips
  // the whoami fetch and
  // runs as an anonymous local developer (useful for standalone `vite`
  // sessions without the proxy in front).
  authEnabled: env.VITE_AUTH === '1',

  // --- telemetry --------------------------------------------------------
  /**
   * `'appinsights'` → ship to Azure Application Insights via the
   *   same-origin BFF proxy at `/api/monitoring/v2/track`. The backend
   *   re-exports events to Azure Monitor, so no connection string or
   *   instrumentation key is needed in the SPA.
   * `'console'`     → log to devtools console.
   * `'none'`        → no-op.
   * Default: `'console'` in dev, `'none'` in prod.
   */
  telemetryBackend: ((): TelemetryBackend => {
    const raw = trim(str(env.VITE_TELEMETRY)).toLowerCase()
    if (isTelemetryBackend(raw)) return raw
    return env.DEV ? TelemetryBackend.Console : TelemetryBackend.None
  })(),

  // --- repo / version ---------------------------------------------------
  /**
   * Base URL of the source repository, used by `<VersionText>` to link a
   * commit hash. Override with `VITE_REPO_URL` when forking this template.
   */
  repoUrl: trim(str(env.VITE_REPO_URL)) || 'https://github.com/equinor/template-fastapi-react',
} as const

export type AppEnv = typeof ENV
