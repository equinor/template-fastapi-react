/**
 * Tests for `selectTelemetry`. Backends are passed in as spies so the
 * test verifies dispatch logic without instantiating the real
 * Application Insights SDK.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Telemetry } from './telemetry'
import { selectTelemetry, type TelemetryBackends, TelemetryProvider } from './telemetry'

const stub = (): Telemetry => ({
  trackException: () => {},
  trackEvent: () => {},
  setUser: () => {},
})

let backends: TelemetryBackends
let appInsights: ReturnType<typeof vi.fn<TelemetryBackends['appInsights']>>
let consoleBackend: ReturnType<typeof vi.fn<TelemetryBackends['console']>>
let noop: ReturnType<typeof vi.fn<TelemetryBackends['noop']>>

beforeEach(() => {
  appInsights = vi.fn(stub)
  consoleBackend = vi.fn(stub)
  noop = vi.fn(stub)
  backends = { appInsights, console: consoleBackend, noop }
})

describe('selectTelemetry', () => {
  test("provider='console' picks the console backend", () => {
    selectTelemetry(TelemetryProvider.Console, '', backends)
    expect(consoleBackend).toHaveBeenCalledTimes(1)
    expect(noop).not.toHaveBeenCalled()
    expect(appInsights).not.toHaveBeenCalled()
  })

  test("provider='none' picks the noop backend", () => {
    selectTelemetry(TelemetryProvider.None, '', backends)
    expect(noop).toHaveBeenCalledTimes(1)
    expect(consoleBackend).not.toHaveBeenCalled()
  })

  test("provider='appinsights' with connection string picks appinsights", () => {
    selectTelemetry(TelemetryProvider.AppInsights, 'InstrumentationKey=abc', backends)
    expect(appInsights).toHaveBeenCalledWith('InstrumentationKey=abc', undefined)
    expect(consoleBackend).not.toHaveBeenCalled()
  })

  test("provider='appinsights' forwards proxy path to the backend", () => {
    selectTelemetry(TelemetryProvider.AppInsights, 'InstrumentationKey=abc', backends, '/api/monitoring')
    expect(appInsights).toHaveBeenCalledWith('InstrumentationKey=abc', '/api/monitoring')
  })

  test("provider='appinsights' with empty connection string falls back to console + warns", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      selectTelemetry(TelemetryProvider.AppInsights, '', backends)
      expect(consoleBackend).toHaveBeenCalledTimes(1)
      expect(appInsights).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0]?.[0]).toMatch(/falling back to console/i)
    } finally {
      warn.mockRestore()
    }
  })
})
