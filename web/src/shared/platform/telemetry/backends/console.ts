import type { Telemetry } from '../telemetry'

export const createConsoleTelemetry = (): Telemetry => ({
  trackException: (err, ctx) => {
    // eslint-disable-next-line no-console
    console.error('[telemetry] exception', err, ctx)
  },
  trackEvent: (name, props) => {
    // eslint-disable-next-line no-console
    console.info('[telemetry] event', name, props)
  },
  setUser: (id) => {
    // eslint-disable-next-line no-console
    console.info('[telemetry] setUser', id)
  },
})
