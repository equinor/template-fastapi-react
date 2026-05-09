import type { Telemetry } from '../types'

export const createConsoleTelemetry = (): Telemetry => ({
  trackException: (err, ctx) => {
    console.error('[telemetry] exception', err, ctx)
  },
  trackEvent: (name, props) => {
    console.info('[telemetry] event', name, props)
  },
  setUser: (id) => {
    console.info('[telemetry] setUser', id)
  },
})
