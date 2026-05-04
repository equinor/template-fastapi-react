/**
 * App-level providers, outermost first:
 *   TelemetryProvider (error boundary; renders <ApplicationError /> on crash)
 *   → AuthProvider (PKCE; no-op in dev)
 *     → FeatureFlagsProvider (role-aware feature toggles)
 *       → QueryClientProvider (TanStack Query)
 *         → AuthTokenSync + SessionExpiredDialog + children
 *
 * Mount once at the top of the tree in `index.tsx`.
 */

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { FEATURE_FLAGS } from '@/config/featureFlags'
import { configureApiClient } from '@/shared/api/apiClient'
import { queryClient } from '@/shared/api/queryClient'
import { AuthProvider } from '@/shared/platform/auth/AuthProvider'
import { FeatureFlagsProvider } from '@/shared/platform/feature-flags/FeatureFlagsContext'
import { TelemetryProvider } from '@/shared/platform/telemetry/TelemetryProvider'
import { ToastContainer } from '@/shared/platform/toast'
import { ApplicationError } from './ApplicationError'
import { AuthTokenSync } from './auth/AuthTokenSync'
import { SessionExpiredDialog } from './auth/SessionExpiredDialog'

// Configure the generated SDK once, when this module is first imported.
// Module-init (not useEffect) so the client is wired before any child
// component fires a query.
configureApiClient()

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <TelemetryProvider fallback={ApplicationError}>
    <AuthProvider>
      <FeatureFlagsProvider flags={FEATURE_FLAGS}>
        <QueryClientProvider client={queryClient}>
          <AuthTokenSync />
          <SessionExpiredDialog />
          {children}
          <ToastContainer />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FeatureFlagsProvider>
    </AuthProvider>
  </TelemetryProvider>
)
