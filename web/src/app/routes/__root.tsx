import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { ErrorPage } from '@/app/error-pages/ErrorPage/ErrorPage'
import { RouteErrorBoundary } from '@/app/error-pages/RouteErrorBoundary/RouteErrorBoundary'
import { RootLayout } from '@/app/layout/RootLayout/RootLayout'
import { userQuery } from '@/shared/platform/auth'
import type { Telemetry } from '@/shared/platform/telemetry'

export interface RouterContext {
  queryClient: QueryClient
  telemetry: Telemetry
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context: { queryClient, telemetry } }) => {
    // Resolve the user once before any component mounts
    const user = await queryClient.ensureQueryData(userQuery())
    telemetry.setUser(user.id)
  },
  component: RootLayout,
  errorComponent: RouteErrorBoundary,
  notFoundComponent: () => <ErrorPage errorCode={404} />,
})
