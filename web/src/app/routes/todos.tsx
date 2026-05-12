import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { hasPermissionCheck } from '@/config/accessControl'
import { todoListQuery, TodosPage } from '@/features/todos'
import { userQuery } from '@/shared/platform/auth'

// `?status=` is the only piece of URL state owned by this page; the
// schema doubles as the runtime validator and the type fed to
// `useSearch`. Defaulting to `'all'` keeps the URL clean — TanStack
// Router omits defaulted keys from the rendered query string.
const searchSchema = z.object({
  status: z.enum(['all', 'active', 'done']).default('all'),
})

export const Route = createFileRoute('/todos')({
  // Gate the route on `todos:read`. The root route already primed
  // `userQuery`, so this is a cheap cache hit; calling it here keeps
  // the route self-contained and matches the pattern documented in
  // `shared/platform/access-control/README.md`. A 403 `Response` is
  // caught by `RouteErrorBoundary`.
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(userQuery())
    if (hasPermissionCheck(user, 'todos', 'read') !== true) {
      throw new Response(null, { status: 403 })
    }
  },
  // Prime the todo list cache so `useTodos` (useSuspenseQuery) gets an
  // instant cache hit on first paint instead of suspending.
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(todoListQuery()),
  component: TodosPage,
  validateSearch: searchSchema,
})
