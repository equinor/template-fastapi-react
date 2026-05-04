import { beforeEach, describe, expect, test, vi } from 'vitest'

const appInsightsFactory = vi.hoisted(() =>
  vi.fn(() => ({
    trackException: vi.fn(),
    trackEvent: vi.fn(),
    setUser: vi.fn(),
  }))
)
vi.mock('./backends/appinsights', () => ({
  createAppInsightsTelemetry: appInsightsFactory,
}))

const loadTelemetry = async () => {
  vi.resetModules()
  return await import('./createTelemetry')
}

beforeEach(() => {
  appInsightsFactory.mockClear()
})

describe('telemetry backend selection', () => {
  test("backend='console' logs to console", async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { createTelemetry, TelemetryBackend } = await loadTelemetry()
    const telemetry = createTelemetry(TelemetryBackend.Console)
    telemetry.trackEvent('hello')
    expect(info).toHaveBeenCalledWith('[telemetry] event', 'hello', undefined)
    expect(appInsightsFactory).not.toHaveBeenCalled()
    info.mockRestore()
  })

  test("backend='none' is a no-op", async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { createTelemetry, TelemetryBackend } = await loadTelemetry()
    const telemetry = createTelemetry(TelemetryBackend.None)
    telemetry.trackEvent('hello')
    telemetry.trackException(new Error('x'))
    expect(info).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    info.mockRestore()
    error.mockRestore()
  })

  test("backend='appinsights' constructs the AI backend", async () => {
    const { createTelemetry, TelemetryBackend } = await loadTelemetry()
    createTelemetry(TelemetryBackend.AppInsights)
    expect(appInsightsFactory).toHaveBeenCalledWith()
  })
})
