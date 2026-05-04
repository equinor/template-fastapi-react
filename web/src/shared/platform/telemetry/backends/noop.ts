import type { Telemetry } from '../telemetry'

export const createNoopTelemetry = (): Telemetry => ({
  trackException: () => {},
  trackEvent: () => {},
  setUser: () => {},
})
