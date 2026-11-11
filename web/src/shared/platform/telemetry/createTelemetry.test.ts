import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { createTelemetry, TelemetryBackend } from './index'

afterEach(() => vi.restoreAllMocks())

describe('Hermes telemetry backend selection', () => {
  test("backend='console' logs to console", () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    createTelemetry(TelemetryBackend.Console).trackEvent('hello')
    expect(info).toHaveBeenCalledWith('[telemetry] event', 'hello', undefined)
  })

  test("backend='none' is a no-op", () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const telemetry = createTelemetry(TelemetryBackend.None)
    telemetry.trackEvent('hello')
    telemetry.trackException(new Error('x'))
    expect(info).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })
})
