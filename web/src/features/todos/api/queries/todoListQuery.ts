/**
 * `queryOptions()` factories — shared by route loaders and component hooks.
 *
 * Loaders call `queryClient.ensureQueryData(todoListQuery())` before render
 * so the page paints with data already in cache; the component then calls
 * `useSuspenseQuery(todoListQuery())` and gets an instant cache hit. Same
 * factory, same key, no drift.
 *
 * The base `queryOptions` (queryKey + queryFn) come from the generated
 * TanStack Query plugin, so a server-side route or schema change surfaces
 * as a compile error here instead of a runtime mismatch. We layer on
 * cross-cutting `meta` (used by `shared/platform/api/createBaseQueryClient` for toasts).
 */

import { getAllTodosOptions } from '@/api-generated/@tanstack/react-query.gen'

export const todoListQuery = () => ({
  ...getAllTodosOptions(),
  meta: {
    // Background refetch failures only — initial-load errors are
    // surfaced through the component's `error` state.
    errorMessage: 'Could not refresh todos',
  },
})
