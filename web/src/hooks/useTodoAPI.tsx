import { useCallback } from 'react'
import { type AddTodoResponse, ApiError, type ErrorResponse, TodoService } from '../api/generated'

export function useTodoAPI() {
  const addTodoItem = useCallback(async (title: string) => {
    return TodoService.create({ title }).catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  const getAllTodoItems = useCallback(async () => {
    return TodoService.getAll().catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  const toggleTodoItem = useCallback(async (todo: AddTodoResponse) => {
    return TodoService.updateById(todo.id, {
      is_completed: !todo.is_completed,
      title: todo.title,
    }).catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  const removeTodoItem = useCallback(async (todo: AddTodoResponse) => {
    return TodoService.deleteById(todo.id).catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  return { addTodoItem, getAllTodoItems, toggleTodoItem, removeTodoItem }
}
