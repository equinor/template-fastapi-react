import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { SessionExpiredDialog } from '@/app/auth/SessionExpiredDialog/SessionExpiredDialog'
import { ApplicationError } from '@/app/bootstrap/ApplicationError'
import { type Telemetry, TelemetryErrorBoundary, TelemetryProvider } from '@/shared/platform/telemetry'

export interface ProvidersProps {
  telemetry: Telemetry
  queryClient: QueryClient
  onReauthenticated: () => void | Promise<void>
  children: React.ReactNode
}

export const Providers = ({ telemetry, queryClient, onReauthenticated, children }: ProvidersProps) => (
  <TelemetryProvider telemetry={telemetry}>
    <TelemetryErrorBoundary telemetry={telemetry} fallback={ApplicationError}>
      <QueryClientProvider client={queryClient}>
        <SessionExpiredDialog onReauthenticated={onReauthenticated} />
        {children}
        <ToastContainer position="bottom-right" />
      </QueryClientProvider>
    </TelemetryErrorBoundary>
  </TelemetryProvider>
)
