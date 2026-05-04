import { TelemetryBackend } from './backend'
import { createAppInsightsTelemetry } from './backends/appinsights'
import { createConsoleTelemetry } from './backends/console'
import { createNoopTelemetry } from './backends/noop'
import type { Telemetry } from './types'

export { isTelemetryBackend, TelemetryBackend } from './backend'

export const createTelemetry = (backend: TelemetryBackend): Telemetry => {
  switch (backend) {
    case TelemetryBackend.AppInsights:
      return createAppInsightsTelemetry()
    case TelemetryBackend.Console:
      return createConsoleTelemetry()
    case TelemetryBackend.None:
      return createNoopTelemetry()
  }
}
