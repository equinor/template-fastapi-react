import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/app/layout/RootLayout'
import { hasPermissionCheck } from '@/config/accessControl'
import { TodosPage, todoListQuery } from '@/features/todos'
import { queryClient } from '@/shared/api/queryClient'
import { requireAuth } from '@/shared/platform/auth/auth'
import { NotFoundPage } from './NotFoundPage'
import { RouteErrorBoundary } from './RouteErrorBoundary'

/**
 * Loader for `/`. Resolves the current user (no-op in dev), enforces the
 * `read` permission on `todos`, then primes the query cache so the page
 * paints with data. The component re-uses the same `queryOptions()`
 * factory and gets a cache hit.
 *
 * Permission failures throw a 403 `Response`; `RouteErrorBoundary` maps
 * that to `<ForbiddenPage />` *in place* — the URL stays at `/` and the
 * back button does the right thing (one redirect-vs-throw strategy, not
 * both).
 */
const todosLoader = async () => {
  const user = await requireAuth()
  if (hasPermissionCheck(user, 'todos', 'read') !== true) {
    throw new Response(null, { status: 403, statusText: 'Forbidden' })
  }
  await queryClient.ensureQueryData(todoListQuery())
  return null
}

/**
 * `errorElement` lives on the child routes (not the layout route) so the
 * `<RootLayout>` chrome stays mounted when a loader throws — the error
 * UI renders inside the layout's `<Outlet />`. Putting it on the parent
 * would replace the layout itself, leaving the user with a chromeless
 * page and no nav.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <TodosPage />, loader: todosLoader, errorElement: <RouteErrorBoundary /> },
      { path: '*', element: <NotFoundPage />, errorElement: <RouteErrorBoundary /> },
    ],
  },
])
