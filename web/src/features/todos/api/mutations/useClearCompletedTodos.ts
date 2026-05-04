/**
 * Bulk-delete all completed todos. Reads the current cached list itself
 * (no `ids` parameter) so callers don't need to know cache keys — they
 * just `mutate()`.
 *
 * The API has no batch endpoint, so we fan out individual DELETEs with
 * `Promise.allSettled`: a partial failure surfaces a precise summary
 * ("Deleted 4 of 5") instead of the all-or-nothing "Could not clear".
 *
 * If the API later grows a `DELETE /todos?status=done` endpoint, swap
 * the fan-out for a single call here — call sites don't change.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/platform/toast'
import { todoInvalidations } from '../invalidations'
import { todoKeys } from '../keys'
import type { Todo } from '../schema'
import { todosApi } from '../todosApi'

type ClearResult = { deleted: number; failed: number }

export const useClearCompletedTodos = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<ClearResult> => {
      const todos = qc.getQueryData<Todo[]>(todoKeys.lists()) ?? []
      const ids = todos.filter((t) => t.is_completed).map((t) => t.id)
      if (ids.length === 0) return { deleted: 0, failed: 0 }

      const results = await Promise.allSettled(ids.map((id) => todosApi.remove(id)))
      const failed = results.filter((r) => r.status === 'rejected').length
      return { deleted: ids.length - failed, failed }
    },
    onSuccess: ({ deleted, failed }) => {
      // The MutationCache emits a generic `successMessage`; we want a
      // contextual one here, so drive the toast manually and skip the
      // global message via `meta.skipToast`.
      if (deleted === 0 && failed === 0) return
      if (failed === 0) {
        toast.success(`Cleared ${deleted} completed ${deleted === 1 ? 'todo' : 'todos'}`)
      } else if (deleted === 0) {
        toast.error(`Could not clear ${failed} completed ${failed === 1 ? 'todo' : 'todos'}`)
      } else {
        toast.info(`Cleared ${deleted}, failed ${failed}`)
      }
    },
    meta: {
      invalidates: todoInvalidations.onDelete(),
      skipToast: true,
      // Surfaced on a *thrown* error (network down, etc.); per-item
      // failures don't reach here thanks to allSettled.
      errorMessage: 'Could not clear completed todos',
    },
  })
}
