import { createRouter, RouterProvider } from '@tanstack/react-router'
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { ApplicationError } from './app/bootstrap/ApplicationError'
import { createQueryClient } from './app/bootstrap/createQueryClient'
import { Providers } from './app/bootstrap/Providers'
import { routerDefaults } from './app/bootstrap/routerDefaults'
import { routeTree } from './app/routeTree.gen'
import { ENV } from './config/env'
import { configureApiClient } from './shared/platform/api'
import { startSessionWatcher } from './shared/platform/auth'
import { createTelemetry, registerGlobalErrorHandlers } from './shared/platform/telemetry'
import './app/styles/index.css'

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : null
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-router-devtools').then((m) => ({ default: m.TanStackRouterDevtools })))
  : null

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
    ...routerDefaults,
  })
  root.render(
    <StrictMode>
      <Providers telemetry={telemetry} queryClient={queryClient} onReauthenticated={router.invalidate}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && ReactQueryDevtools && TanStackRouterDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
            <TanStackRouterDevtools router={router} initialIsOpen={false} position="bottom-right" />
          </Suspense>
        )}
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
