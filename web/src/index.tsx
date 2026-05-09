import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApplicationError } from './app/bootstrap/ApplicationError'
import { createQueryClient } from './app/bootstrap/createQueryClient'
import { Providers } from './app/bootstrap/Providers'
import { routeTree } from './app/routeTree.gen'
import { ENV } from './config/env'
import { LoadingState } from './shared/components/LoadingState/LoadingState'
import { configureApiClient } from './shared/platform/api'
import { startSessionWatcher } from './shared/platform/auth'
import { createTelemetry, registerGlobalErrorHandlers } from './shared/platform/telemetry'
import './app/styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')
const root = createRoot(container)

try {
  const telemetry = createTelemetry(ENV.telemetryBackend)
  configureApiClient({ telemetry })
  const queryClient = createQueryClient({ telemetry })
  startSessionWatcher(queryClient)
  registerGlobalErrorHandlers(telemetry)

  const router = createRouter({
    routeTree,
    context: { queryClient, telemetry },
    defaultPreload: 'intent',
    // Shown while a route's `loader`/`beforeLoad` is pending. Without
    // this, TanStack Router renders nothing, which flashes a blank
    // screen on cold navigations.
    defaultPendingComponent: () => <LoadingState variant="fullscreen" label="Loading…" />,
  })
  root.render(
    <StrictMode>
      <Providers telemetry={telemetry} queryClient={queryClient}>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>
  )
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Bootstrap failed', error)
  root.render(<ApplicationError error={error} />)
}

// Type-safe router registration.
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter<typeof routeTree>>
  }
}
