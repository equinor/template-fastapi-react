/**
 * Optimistic toggle — instantly flips the checkbox before the server
 * confirms. Rolls back only the toggled todo on error (a whole-list
 * snapshot would undo other toggles that succeeded meanwhile);
 * meta-driven invalidate on success.
 *
 * Cache invalidation and toast notifications are *declared* via `meta`
 * and executed by the global `MutationCache` handlers in
 * `shared/platform/api/createBaseQueryClient`. Don't add `onSuccess: () => qc.invalidateQueries(...)` here. */

import { type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTodoById } from '@/api-generated'
import { todoInvalidations } from '../invalidations'
import { todoKeys } from '../keys'
import type { Todo } from '../schema'

const setCompletedInLists = (qc: QueryClient, id: Todo['id'], isCompleted: boolean) =>
  qc.setQueriesData<Todo[]>({ queryKey: todoKeys.lists() }, (list) =>
    list?.map((t) => (t.id === id ? { ...t, is_completed: isCompleted } : t))
  )

export const useToggleTodo = () => {
  const qc = useQueryClient()
  return useMutation<unknown, unknown, Todo>({
    mutationFn: (todo) =>
      updateTodoById({
        path: { id: todo.id },
        body: { title: todo.title, is_completed: !todo.is_completed },
        throwOnError: true,
      }),
    onMutate: async (todo) => {
      await qc.cancelQueries({ queryKey: todoKeys.lists() })
      setCompletedInLists(qc, todo.id, !todo.is_completed)
    },
    onError: (_e, todo) => {
      setCompletedInLists(qc, todo.id, todo.is_completed)
    },
    meta: {
      invalidates: todoInvalidations.onToggle(),
      // The optimistic UI flip is the success feedback — no toast needed.
      // We still surface a toast on failure so the rollback isn't silent.
      errorMessage: 'Could not update todo',
    },
  })
}
