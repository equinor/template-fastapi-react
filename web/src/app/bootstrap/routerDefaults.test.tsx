/**
 * Regression tests for the router-wide defaults, in particular the
 * `defaultErrorComponent` wiring: a leaf route's error must be caught by
 * the leaf's own boundary instead of bubbling to the root route's
 * `errorComponent`, which would unmount the layout (header) together with
 * the page content.
 */

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { RouteErrorBoundary } from '@/app/error-pages/RouteErrorBoundary/RouteErrorBoundary'
import type { ApiError } from '@/shared/platform/api'
import { AUTH_SUCCESS_MESSAGE, sessionExpiredStore } from '@/shared/platform/auth'
import { createTelemetry, TelemetryBackend, TelemetryProvider } from '@/shared/platform/telemetry'
import { createQueryClient } from './createQueryClient'
import { Providers } from './Providers'
import { routerDefaults } from './routerDefaults'

const StubLayout = () => (
  <>
    <header>persistent layout</header>
    <Outlet />
  </>
)

const renderWithThrowingPage = (thrown: unknown) => {
  const ThrowingPage = (): never => {
    throw thrown
  }
  const rootRoute = createRootRoute({
    component: StubLayout,
    errorComponent: () => <div>root error boundary (should not appear)</div>,
  })
  const leafRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: ThrowingPage,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([leafRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    ...routerDefaults,
  })
  const telemetry = createTelemetry(TelemetryBackend.None)
  const trackException = vi.spyOn(telemetry, 'trackException')

  render(
    <TelemetryProvider telemetry={telemetry}>
      <RouterProvider router={router} />
    </TelemetryProvider>
  )
  return { trackException }
}

beforeEach(() => {
  // React and TanStack Router log caught render errors; keep the output clean.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  sessionExpiredStore._reset()
  vi.restoreAllMocks()
})

describe('routerDefaults', () => {
  test('a leaf route error is caught locally, keeping the layout mounted', async () => {
    const error = new Error('boom')
    const { trackException } = renderWithThrowingPage(error)

    expect(await screen.findByRole('heading', { level: 2, name: 'Something went wrong' })).toBeInTheDocument()
    expect(screen.getByText('persistent layout')).toBeInTheDocument()
    expect(screen.queryByText('root error boundary (should not appear)')).not.toBeInTheDocument()
    expect(trackException).toHaveBeenCalledWith(error)
  })

  test('a 401 renders a sign-in-required page instead of a blank screen', async () => {
    const unauthorized: ApiError = {
      kind: 'http',
      status: 401,
      traceId: 't1',
      message: 'unauthorized',
    }
    const { trackException } = renderWithThrowingPage(unauthorized)

    expect(await screen.findByText('Sign-in required')).toBeInTheDocument()
    expect(screen.getByText('persistent layout')).toBeInTheDocument()
    expect(trackException).not.toHaveBeenCalled()
  })

  test.each(['root beforeLoad', 'leaf loader'])(
    'successful reauthentication retries a failed %s without navigating away',
    async (failureLocation) => {
      let signedIn = false
      const unauthorized: ApiError = {
        kind: 'http',
        status: 401,
        traceId: 't1',
        message: 'unauthorized',
      }
      const loadProtectedRoute = vi.fn(() => {
        if (!signedIn) {
          sessionExpiredStore.notify()
          throw unauthorized
        }
      })
      const rootRoute = createRootRoute({
        component: StubLayout,
        errorComponent: RouteErrorBoundary,
        beforeLoad: failureLocation === 'root beforeLoad' ? loadProtectedRoute : undefined,
      })
      const leafRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        loader: failureLocation === 'leaf loader' ? loadProtectedRoute : undefined,
        component: () => <div>protected page</div>,
      })
      const router = createRouter({
        routeTree: rootRoute.addChildren([leafRoute]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
        ...routerDefaults,
      })
      const telemetry = createTelemetry(TelemetryBackend.None)
      const queryClient = createQueryClient({ telemetry })

      render(
        <Providers telemetry={telemetry} queryClient={queryClient} onReauthenticated={router.invalidate}>
          <RouterProvider router={router} />
        </Providers>
      )

      expect(await screen.findByText('Sign-in required')).toBeInTheDocument()
      expect(screen.getByText('Session expired')).toBeInTheDocument()
      expect(loadProtectedRoute).toHaveBeenCalledOnce()

      signedIn = true
      await act(async () => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: AUTH_SUCCESS_MESSAGE,
            origin: window.location.origin,
          })
        )
      })

      expect(await screen.findByText('protected page')).toBeInTheDocument()
      expect(loadProtectedRoute).toHaveBeenCalledTimes(2)
      expect(screen.queryByText('Sign-in required')).not.toBeInTheDocument()
      expect(screen.queryByText('Session expired')).not.toBeInTheDocument()
      expect(router.state.location.pathname).toBe('/')
    }
  )
})
