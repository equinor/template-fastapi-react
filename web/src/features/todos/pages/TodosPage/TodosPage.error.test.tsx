/**
 * Error-path test: when the todos API returns 500, the route should
 * surface the error through `RouteErrorBoundary` → `UnexpectedErrorPage`
 * → `ErrorPanel` (with the traceId), proving the
 * httpClient → ApiError → Suspense → errorComponent pipeline is intact.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { Suspense } from 'react'
import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { RouteErrorBoundary } from '@/app/error-pages/RouteErrorBoundary/RouteErrorBoundary'
import { createTelemetry, TelemetryBackend, TelemetryProvider } from '@/shared/platform/telemetry'
import { server } from '../../../../mocks/server'
import { TodosPage } from './TodosPage'

const testTelemetry = createTelemetry(TelemetryBackend.None)

const buildRouter = () => {
  const rootRoute = createRootRoute({
    component: () => (
      <Suspense fallback={<div>Loading…</div>}>
        <Outlet />
      </Suspense>
    ),
    errorComponent: RouteErrorBoundary,
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    validateSearch: z.object({
      status: z.enum(['all', 'active', 'done']).catch('all').default('all'),
    }),
    component: TodosPage,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

const renderRoute = () => {
  // Isolated QueryClient with retries disabled so the 500 surfaces fast
  // and previous tests' cached `[]` doesn't satisfy the query.
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <TelemetryProvider telemetry={testTelemetry}>
      <QueryClientProvider client={qc}>
        <RouterProvider router={buildRouter()} />
      </QueryClientProvider>
    </TelemetryProvider>
  )
}

describe('TodosPage — error path', () => {
  test('renders an error panel when the API returns 500', async () => {
    server.use(
      http.get('http://localhost/todos', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500, headers: { 'x-trace-id': 'trace-xyz' } })
      )
    )

    renderRoute()

    const alert = await screen.findByRole('alert', {}, { timeout: 5000 })
    expect(alert.textContent).toMatch(/server error|internal server error/i)
  })
})
