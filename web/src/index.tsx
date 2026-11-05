import './config/zod'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { initColorScheme, useCustomToast } from '@team-hermes/react-components'
import { lazy, StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ApplicationError } from './app/bootstrap/ApplicationError'
import { createQueryClient } from './app/bootstrap/createQueryClient'
import { Providers } from './app/bootstrap/Providers'
import { routerDefaults } from './app/bootstrap/routerDefaults'
import { routeTree } from './app/routeTree.gen'
import { ENV } from './config/env'
import { configureApiClient } from './shared/platform/api'
import { startSessionWatcher } from './shared/platform/auth'
import { createTelemetry, registerGlobalErrorHandlers, TelemetryErrorBoundary } from './shared/platform/telemetry'
import '@team-hermes/react-components/style.css'
import 'react-toastify/dist/ReactToastify.css'
import './app/styles/index.css'

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : null
const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      }))
    )
  : null

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')
const root = createRoot(container)

const telemetry = createTelemetry(ENV.telemetryBackend)

const Application = () => {
  const toast = useCustomToast()
  const [{ queryClient, router }] = useState(() => {
    const queryClient = createQueryClient({ telemetry, toast })
    const router = createRouter({
      routeTree,
      context: { queryClient, telemetry },
      ...routerDefaults,
    })
    return { queryClient, router }
  })
  useEffect(() => {
    const stopWatcher = startSessionWatcher(queryClient)
    const removeErrorHandlers = registerGlobalErrorHandlers(telemetry)
    return () => {
      stopWatcher()
      removeErrorHandlers()
    }
  }, [queryClient])

  return (
    <Providers telemetry={telemetry} queryClient={queryClient} onReauthenticated={router.invalidate}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && ReactQueryDevtools && TanStackRouterDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools router={router} initialIsOpen={false} position="bottom-right" />
        </Suspense>
      )}
    </Providers>
  )
}

try {
  initColorScheme()
  configureApiClient({ telemetry })
  root.render(
    <StrictMode>
      {/* React 19 render errors are reported through the root boundary, not the synchronous bootstrap catch. */}
      <TelemetryErrorBoundary telemetry={telemetry} fallback={ApplicationError}>
        <Application />
      </TelemetryErrorBoundary>
    </StrictMode>
  )
} catch (error) {
  // oxlint-disable-next-line no-console
  console.error('Bootstrap failed', error)
  root.render(<ApplicationError error={error} />)
}

if (import.meta.hot) import.meta.hot.dispose(() => root.unmount())

// Type-safe router registration.
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter<typeof routeTree>>
  }
}
