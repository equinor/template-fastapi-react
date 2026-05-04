import { useMutation } from '@tanstack/react-query'
import { deleteTodoByIdMutation } from '@/api-generated/@tanstack/react-query.gen'
import { todoInvalidations } from '../invalidations'

export const useDeleteTodo = () =>
  useMutation({
    ...deleteTodoByIdMutation(),
    meta: {
      invalidates: todoInvalidations.onDelete(),
      successMessage: 'Todo deleted',
      errorMessage: 'Could not delete todo',
    },
  })
