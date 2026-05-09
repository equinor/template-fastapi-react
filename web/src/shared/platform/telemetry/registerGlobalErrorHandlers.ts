import type { Telemetry } from './types'

// Catches errors that escape React (event handlers, setTimeout, fire-and-forget
// promises). Render-time errors are handled by TelemetryErrorBoundary.
export const registerGlobalErrorHandlers = (telemetry: Telemetry) => {
  window.addEventListener('unhandledrejection', (event) => {
    telemetry.trackException(event.reason, { source: 'unhandledrejection' })
  })
  window.addEventListener('error', (event) => {
    telemetry.trackException(event.error ?? event.message, { source: 'window.onerror' })
  })
}
