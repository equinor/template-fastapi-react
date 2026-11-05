import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { expect, test, vi } from 'vitest'
import { registerGlobalErrorHandlers } from '../registerGlobalErrorHandlers'
import { createAppInsightsTelemetry } from './appinsights'

const trackException = vi.hoisted(() => {
  vi.resetModules()
  return vi.fn()
})

vi.mock('@microsoft/applicationinsights-web', () => ({
  ApplicationInsights: vi.fn(
    class {
      loadAppInsights = vi.fn()
      trackPageView = vi.fn()
      trackException = trackException
    }
  ),
}))

test('the app owns uncaught exception tracking instead of collecting it twice', () => {
  const telemetry = createAppInsightsTelemetry()
  expect(ApplicationInsights).toHaveBeenCalledWith({
    config: expect.objectContaining({
      disableExceptionTracking: true,
      enableUnhandledPromiseRejectionTracking: false,
      connectionString: expect.stringContaining(`IngestionEndpoint=${window.location.origin}/api/monitoring/`),
    }),
  })
  const listeners = vi.spyOn(window, 'addEventListener')
  registerGlobalErrorHandlers(telemetry)
  const error = new Error('Uncaught failure')

  window.dispatchEvent(new ErrorEvent('error', { error }))

  expect(trackException).toHaveBeenCalledExactlyOnceWith({
    exception: error,
    properties: { source: 'window.onerror' },
  })
  for (const [type, listener] of listeners.mock.calls) window.removeEventListener(type, listener)
  listeners.mockRestore()
})
