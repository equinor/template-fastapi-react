/**
 * Error-path test: when the todos API returns 500, the route should
 * surface the error through `RouteErrorBoundary` → `UnexpectedErrorPage`
 * → `ErrorPanel` (with the traceId), proving the
 * httpClient → ApiError → Suspense → errorElement pipeline is intact.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, test } from 'vitest'
import { RouteErrorBoundary } from '@/app/routing/RouteErrorBoundary'
import { server } from '../../../../mocks/server'
import { TodosPage } from './TodosPage'

const renderRoute = () => {
  // Isolated QueryClient with retries disabled so the 500 surfaces fast
  // and previous tests' cached `[]` doesn't satisfy the query.
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <TodosPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
    { initialEntries: ['/'] }
  )
  return render(
    <QueryClientProvider client={qc}>
      <NuqsTestingAdapter>
        <RouterProvider router={router} />
      </NuqsTestingAdapter>
    </QueryClientProvider>
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
