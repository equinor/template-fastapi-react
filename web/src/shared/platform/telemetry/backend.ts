// Backend identifiers. Separate from createTelemetry.ts so `@/config/env`
// can import without creating a cycle.

export const TelemetryBackend = {
  AppInsights: 'appinsights',
  Console: 'console',
  None: 'none',
} as const

export type TelemetryBackend = (typeof TelemetryBackend)[keyof typeof TelemetryBackend]

export const isTelemetryBackend = (v: string): v is TelemetryBackend =>
  (Object.values(TelemetryBackend) as string[]).includes(v)
