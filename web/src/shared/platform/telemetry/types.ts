export type Telemetry = {
  trackException: (err: unknown, ctx?: Record<string, unknown>) => void
  trackEvent: (name: string, props?: Record<string, unknown>) => void
  setUser: (id: string | null) => void
}
