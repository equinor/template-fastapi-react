import { useMutation } from '@tanstack/react-query'
import { todoInvalidations } from '../invalidations'
import { todosApi } from '../todosApi'

/**
 * Errors are surfaced inline by `<NewTodoForm>` via `<ErrorPanel>` — the
 * action site is the right place to show what failed. Skipping the global
 * toast avoids double-surfacing the same event.
 */
export const useCreateTodo = () =>
  useMutation({
    mutationFn: todosApi.create,
    meta: {
      invalidates: todoInvalidations.onCreate(),
      successMessage: 'Todo created',
    },
  })
