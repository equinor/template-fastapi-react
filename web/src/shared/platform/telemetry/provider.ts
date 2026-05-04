/**
 * Telemetry backend identifiers. Lives in its own file so `@/config/env`
 * can import it without creating a cycle with `./telemetry`.
 */

export const TelemetryProvider = {
  AppInsights: 'appinsights',
  Console: 'console',
  None: 'none',
} as const

export type TelemetryProvider = (typeof TelemetryProvider)[keyof typeof TelemetryProvider]

export const isTelemetryProvider = (v: string): v is TelemetryProvider =>
  (Object.values(TelemetryProvider) as string[]).includes(v)
