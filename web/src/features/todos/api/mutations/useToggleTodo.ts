/**
 * Optimistic toggle — instantly flips the checkbox before the server
 * confirms. Snapshot+rollback on error; meta-driven invalidate on success.
 *
 * Cache invalidation and toast notifications are *declared* via `meta`
 * and executed by the global `MutationCache` handlers in
 * `shared/api/queryClient`. Don't add `onSuccess: () => qc.invalidateQueries(...)` here.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoInvalidations } from '../invalidations'
import { todoKeys } from '../keys'
import type { Todo } from '../schema'
import { todosApi } from '../todosApi'

export const useToggleTodo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (todo: Todo) =>
      todosApi.update(todo.id, {
        title: todo.title,
        is_completed: !todo.is_completed,
      }),
    onMutate: async (todo) => {
      await qc.cancelQueries({ queryKey: todoKeys.lists() })
      const snapshots = qc.getQueriesData<Todo[]>({
        queryKey: todoKeys.lists(),
      })
      for (const [key, list] of snapshots) {
        if (!list) continue
        qc.setQueryData<Todo[]>(
          key,
          list.map((t) => (t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t))
        )
      }
      return { snapshots }
    },
    onError: (_e, _v, ctx) => {
      if (!ctx) return
      for (const [key, value] of ctx.snapshots) qc.setQueryData(key, value)
    },
    meta: {
      invalidates: todoInvalidations.onToggle(),
      // The optimistic UI flip is the success feedback — no toast needed.
      // We still surface a toast on failure so the rollback isn't silent.
      errorMessage: 'Could not update todo',
    },
  })
}
