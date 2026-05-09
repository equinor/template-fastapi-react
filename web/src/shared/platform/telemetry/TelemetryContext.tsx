import { createContext, type ReactNode, useContext } from 'react'
import type { Telemetry } from './types'

const TelemetryContext = createContext<Telemetry | null>(null)

export const TelemetryProvider = ({ telemetry, children }: { telemetry: Telemetry; children: ReactNode }) => (
  <TelemetryContext.Provider value={telemetry}>{children}</TelemetryContext.Provider>
)

export const useTelemetry = (): Telemetry => {
  const value = useContext(TelemetryContext)
  if (!value) {
    throw new Error('useTelemetry must be used inside <TelemetryProvider>')
  }
  return value
}
