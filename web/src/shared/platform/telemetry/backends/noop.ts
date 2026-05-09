import type { Telemetry } from '../types'

export const createNoopTelemetry = (): Telemetry => ({
  trackException: () => {},
  trackEvent: () => {},
  setUser: () => {},
})
