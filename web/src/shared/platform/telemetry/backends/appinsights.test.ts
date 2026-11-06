import { waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { createTelemetry, registerGlobalErrorHandlers, TelemetryBackend } from '../index'

const { construct, trackException, trackEvent, setUser } = vi.hoisted(() => ({
  construct: vi.fn(),
  trackException: vi.fn(),
  trackEvent: vi.fn(),
  setUser: vi.fn(),
}))

vi.mock('@microsoft/applicationinsights-web', () => ({
  ApplicationInsights: class {
    constructor(config: unknown) {
      construct(config)
    }
    loadAppInsights = vi.fn()
    trackPageView = vi.fn()
    trackException = trackException
    trackEvent = trackEvent
    setAuthenticatedUserContext = setUser
  },
}))
vi.mock('@microsoft/applicationinsights-react-js', () => ({ ReactPlugin: class {} }))

afterEach(() => vi.clearAllMocks())

test('lazy App Insights buffers calls, targets the BFF, and cleans up global handlers', async () => {
  const telemetry = createTelemetry(TelemetryBackend.AppInsights)
  telemetry.setUser('alice')
  telemetry.trackEvent('queued', { traceId: 'trace-1' })
  await waitFor(() => expect(setUser).toHaveBeenCalledWith('alice', undefined, true))
  expect(trackEvent).toHaveBeenCalledWith({ name: 'queued', properties: { traceId: 'trace-1' } })
  expect(construct).toHaveBeenCalledWith({
    config: expect.objectContaining({
      connectionString: expect.stringContaining(`IngestionEndpoint=${window.location.origin}/api/monitoring/`),
    }),
  })
  const addListener = vi.spyOn(window, 'addEventListener')
  const removeListener = vi.spyOn(window, 'removeEventListener')
  const cleanup = registerGlobalErrorHandlers(telemetry)
  const onError = addListener.mock.calls.find(([type]) => type === 'error')?.[1]
  if (typeof onError !== 'function') throw new Error('Global error handler was not registered')
  const error = new Error('Uncaught failure')
  try {
    onError.call(window, new ErrorEvent('error', { error }))
    expect(trackException).toHaveBeenCalledExactlyOnceWith({
      exception: error,
      properties: { source: 'window.onerror' },
    })
  } finally {
    cleanup()
  }
  for (const [type, listener] of addListener.mock.calls) {
    expect(removeListener).toHaveBeenCalledWith(type, listener)
  }
  addListener.mockRestore()
  removeListener.mockRestore()
})

// https://github.com/equinor/team-hermes-packages/pull/93
test.fails('the app owns uncaught exception tracking instead of collecting it twice', async () => {
  createTelemetry(TelemetryBackend.AppInsights)
  await waitFor(() => expect(construct).toHaveBeenCalled())
  expect(construct).toHaveBeenCalledWith({
    config: expect.objectContaining({
      disableExceptionTracking: true,
      enableUnhandledPromiseRejectionTracking: false,
    }),
  })
})
