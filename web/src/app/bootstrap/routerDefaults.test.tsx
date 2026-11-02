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
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import type { ApiError } from '@/shared/platform/api'
import { createTelemetry, TelemetryBackend, TelemetryProvider } from '@/shared/platform/telemetry'
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
  const leafRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: ThrowingPage })
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
    const unauthorized: ApiError = { kind: 'http', status: 401, traceId: 't1', message: 'unauthorized' }
    const { trackException } = renderWithThrowingPage(unauthorized)

    expect(await screen.findByText('Sign-in required')).toBeInTheDocument()
    expect(screen.getByText('persistent layout')).toBeInTheDocument()
    expect(trackException).not.toHaveBeenCalled()
  })
})
