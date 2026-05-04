import { useMutation } from '@tanstack/react-query'
import { createTodoMutation } from '@/api-generated/@tanstack/react-query.gen'
import { todoInvalidations } from '../invalidations'

/**
 * Errors are surfaced inline by `<NewTodoForm>` via `<ErrorPanel>` — the
 * action site is the right place to show what failed. Skipping the global
 * toast avoids double-surfacing the same event.
 *
 * Variables: `{ body: { title } }` (generated SDK shape). Adapt at the
 * call site rather than masking the SDK contract here.
 */
export const useCreateTodo = () =>
  useMutation({
    ...createTodoMutation(),
    meta: {
      invalidates: todoInvalidations.onCreate(),
      successMessage: 'Todo created',
    },
  })
