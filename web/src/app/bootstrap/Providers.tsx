import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionExpiredDialog } from '@/app/auth/SessionExpiredDialog/SessionExpiredDialog'
import { ApplicationError } from '@/app/bootstrap/ApplicationError'
import { TelemetryErrorBoundary, TelemetryProvider } from '@/shared/platform/telemetry'
import { ToastContainer } from '@/shared/platform/toast'
import type { ProvidersProps } from './Providers.types'

// No `<AppInsightsContext.Provider>`: page-views use `enableAutoRouteTracking`
// and nothing currently calls `useAppInsightsContext`.
export const Providers = ({ telemetry, queryClient, children }: ProvidersProps) => (
  <TelemetryProvider telemetry={telemetry}>
    <TelemetryErrorBoundary telemetry={telemetry} fallback={ApplicationError}>
      <QueryClientProvider client={queryClient}>
        <SessionExpiredDialog />
        {children}
        <ToastContainer />
        {/* `import.meta.env.DEV` is statically replaced by Vite, so the
            devtools import is tree-shaken from production builds. */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </TelemetryErrorBoundary>
  </TelemetryProvider>
)
