/**
 * Feature-level integration test: renders TodosPage inside `Providers`
 * (real QueryClient + httpClient + MSW) and exercises the create, filter,
 * mutation, and toast flows.
 *
 * URL state goes through a real TanStack Router memory router whose
 * `/todos` route mirrors `src/app/routes/todos.tsx` (validateSearch +
 * component) but skips the loader so each test starts from a known cache.
 *
 * The error-path test lives separately in `TodosPage.error.test.tsx`
 * because it uses an isolated `QueryClient` to surface 5xx fast.
 */

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Suspense } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import { z } from 'zod'
import { createQueryClient } from '@/app/bootstrap/createQueryClient'
import { Providers } from '@/app/bootstrap/Providers'
import { FEATURE_FLAGS } from '@/config/featureFlags'
import { userQuery } from '@/shared/platform/auth'
import { FeatureFlagsProvider } from '@/shared/platform/feature-flags'
import { createTelemetry, TelemetryBackend } from '@/shared/platform/telemetry'
import { toastStore } from '@/shared/platform/toast'
import { db } from '../../../../mocks/db'
import { server } from '../../../../mocks/server'
import { TodosPage } from './TodosPage'

vi.mock('@/config/env', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/config/env')>()
  return { ...original, ENV: { ...original.ENV, isDev: false, isProd: true } }
})

const telemetry = createTelemetry(TelemetryBackend.None)
let queryClient = createQueryClient({ telemetry })

// Test-local route tree mirroring `src/app/routes/todos.tsx` minus the
// loader. `getRouteApi('/todos')` inside `useTodosFilter` resolves
// against whatever router context is mounted, so the route id MUST be
// `'/todos'`.
const buildRouter = (initialEntry: string) => {
  const rootRoute = createRootRoute({
    component: () => (
      <Suspense fallback={<div>Loading…</div>}>
        <Outlet />
      </Suspense>
    ),
  })
  const todosRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/todos',
    validateSearch: z.object({
      status: z.enum(['all', 'active', 'done']).catch('all').default('all'),
    }),
    component: TodosPage,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([todosRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

const renderPage = (search = '') => {
  const router = buildRouter(`/todos${search}`)
  return render(
    <Providers queryClient={queryClient} telemetry={telemetry} onReauthenticated={router.invalidate}>
      <FeatureFlagsProvider flags={FEATURE_FLAGS} user={{ id: 'u', name: 'u', roles: ['admin'] }}>
        <RouterProvider router={router} />
      </FeatureFlagsProvider>
    </Providers>
  )
}

// Bypass the route loader: hydrate the user directly so
// permission-gated controls render.
const seedAdminUser = () => {
  queryClient.setQueryData(userQuery().queryKey, {
    id: 'anonymous',
    name: 'Local developer',
    roles: ['admin'],
  })
}

describe('TodosPage', () => {
  beforeEach(() => {
    // Fresh client per test so cached `[]` from the previous test doesn't
    // leak across boundaries.
    queryClient = createQueryClient({ telemetry })
  })

  test('renders existing todos from the API', async () => {
    db.todos = [
      { id: '1', user_id: 'u1', title: 'Buy milk', is_completed: false },
      { id: '2', user_id: 'u1', title: 'Walk dog', is_completed: true },
    ]

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeDefined()
      expect(screen.getByText('Walk dog')).toBeDefined()
    })
  })

  test('adds a new todo via the form with production feature flags', async () => {
    const user = userEvent.setup()
    renderPage()

    const input = await screen.findByPlaceholderText('Add Task')
    await user.type(input, 'Write docs')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByText('Write docs')).toBeDefined()
    })
  })

  test('keeps the title after a failed submission and allows retry without an unhandled rejection', async () => {
    const user = userEvent.setup()
    toastStore._reset()
    server.use(
      http.post('http://localhost/todos', () => HttpResponse.json({ message: 'failed' }, { status: 500 }), {
        once: true,
      })
    )
    renderPage()

    const input = await screen.findByPlaceholderText('Add Task')
    await user.type(input, 'Retry this task')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
    expect(input).toHaveValue('Retry this task')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled())

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(input).toHaveValue(''))
    expect(await screen.findByText('Retry this task')).toBeInTheDocument()
    expect(db.todos).toHaveLength(1)
  })

  test('filters todos by status from the URL', async () => {
    db.todos = [
      { id: '1', user_id: 'u1', title: 'Buy milk', is_completed: false },
      { id: '2', user_id: 'u1', title: 'Walk dog', is_completed: true },
    ]

    renderPage('?status=done')

    await waitFor(() => {
      expect(screen.getByText('Walk dog')).toBeDefined()
    })
    expect(screen.queryByText('Buy milk')).toBeNull()
  })

  test('changing the filter hides non-matching todos', async () => {
    const user = userEvent.setup()
    db.todos = [
      { id: '1', user_id: 'u1', title: 'Buy milk', is_completed: false },
      { id: '2', user_id: 'u1', title: 'Walk dog', is_completed: true },
    ]

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeDefined()
    })

    await user.click(screen.getByLabelText('Active'))

    await waitFor(() => {
      expect(screen.queryByText('Walk dog')).toBeNull()
    })
    expect(screen.getByText('Buy milk')).toBeDefined()
  })

  describe('mutations', () => {
    // Toggle and delete go through optimistic mutations + MSW; assert the
    // UI updates immediately and the row is gone after delete.
    beforeEach(seedAdminUser)

    test('toggles a todo', async () => {
      const user = userEvent.setup()
      db.todos = [{ id: '1', user_id: 'u1', title: 'Buy milk', is_completed: false }]
      renderPage()

      await screen.findByText('Buy milk')
      await user.click(screen.getByRole('button', { name: /Mark as done/i }))

      await waitFor(() => {
        expect(screen.getByText('Done')).toBeDefined()
      })
    })

    test('deletes a todo', async () => {
      const user = userEvent.setup()
      db.todos = [{ id: '1', user_id: 'u1', title: 'Buy milk', is_completed: false }]
      renderPage()

      await screen.findByText('Buy milk')
      await user.click(screen.getByRole('button', { name: /Remove/i }))

      await waitFor(() => {
        expect(screen.queryByText('Buy milk')).toBeNull()
      })
    })
  })

  describe('toast wiring', () => {
    /*
     * Locks the meta-driven toast pipeline end-to-end:
     *   useDeleteTodo (meta.successMessage)
     *     → MutationCache.onSuccess in shared/platform/api/createBaseQueryClient
     *     → toast.success → toastStore
     *     → ToastContainer (mounted by Providers)
     *
     * If anyone breaks any link in that chain, this test fails. The unit
     * tests in `shared/platform/toast/toastStore.test.ts` cover the store
     * in isolation; this one proves the wiring.
     */
    beforeEach(() => {
      seedAdminUser()
      toastStore._reset()
    })

    test('shows a success toast after deleting a todo', async () => {
      const user = userEvent.setup()
      db.todos = [{ id: '1', user_id: 'u1', title: 'Buy milk', is_completed: false }]
      renderPage()

      await screen.findByText('Buy milk')
      await user.click(screen.getByRole('button', { name: /Remove/i }))

      const toast = await waitFor(() => screen.getByTestId('toast-success'))
      expect(toast.textContent).toContain('Todo deleted')
    })
  })
})
