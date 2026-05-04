/**
 * `queryOptions()` factories — shared by route loaders and component hooks.
 *
 * Loaders call `queryClient.ensureQueryData(todoListQuery())` before render
 * so the page paints with data already in cache; the component then calls
 * `useQuery(todoListQuery())` and gets an instant cache hit. Same factory,
 * same key, no drift.
 */

import { queryOptions } from '@tanstack/react-query'
import { todoKeys } from '../keys'
import { todosApi } from '../todosApi'

export const todoListQuery = () =>
  queryOptions({
    queryKey: todoKeys.lists(),
    queryFn: todosApi.list,
    meta: {
      // Background refetch failures only — initial-load errors are
      // surfaced through the component's `error` state.
      errorMessage: 'Could not refresh todos',
    },
  })
