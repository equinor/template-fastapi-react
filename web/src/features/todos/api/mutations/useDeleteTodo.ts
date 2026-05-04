import { useMutation } from '@tanstack/react-query'
import { todoInvalidations } from '../invalidations'
import { todosApi } from '../todosApi'

export const useDeleteTodo = () =>
  useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    meta: {
      invalidates: todoInvalidations.onDelete(),
      successMessage: 'Todo deleted',
      errorMessage: 'Could not delete todo',
    },
  })
