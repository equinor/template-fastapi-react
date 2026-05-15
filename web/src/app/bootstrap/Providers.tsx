import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionExpiredDialog } from '@/app/auth/SessionExpiredDialog/SessionExpiredDialog'
import { ApplicationError } from '@/app/bootstrap/ApplicationError'
import { Telemetry, TelemetryErrorBoundary, TelemetryProvider } from '@/shared/platform/telemetry'
import { ToastContainer } from '@/shared/platform/toast'

export interface ProvidersProps {
  telemetry: Telemetry
  queryClient: QueryClient
  children: React.ReactNode
}

export const Providers = ({ telemetry, queryClient, children }: ProvidersProps) => (
  <TelemetryProvider telemetry={telemetry}>
    <TelemetryErrorBoundary telemetry={telemetry} fallback={ApplicationError}>
      <QueryClientProvider client={queryClient}>
        <SessionExpiredDialog />
        {children}
        <ToastContainer />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </TelemetryErrorBoundary>
  </TelemetryProvider>
)
