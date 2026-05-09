import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { NotFoundPage } from '@/app/error-pages/NotFoundPage/NotFoundPage'
import { RouteErrorBoundary } from '@/app/error-pages/RouteErrorBoundary/RouteErrorBoundary'
import { RootLayout } from '@/app/layout/RootLayout/RootLayout'
import { userQuery } from '@/shared/platform/auth'
import type { Telemetry } from '@/shared/platform/telemetry'

export interface RouterContext {
  queryClient: QueryClient
  telemetry: Telemetry
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // Resolve the user once before any component mounts so suspense reads
  // are synchronous, and bridge identity to telemetry in the same step.
  beforeLoad: async ({ context: { queryClient, telemetry } }) => {
    const user = await queryClient.ensureQueryData(userQuery())
    telemetry.setUser(user.id)
  },
  component: RootLayout,
  errorComponent: RouteErrorBoundary,
  notFoundComponent: NotFoundPage,
})
