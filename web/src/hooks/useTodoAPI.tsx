import { useCallback } from 'react'
import { type AddTodoResponse, ApiError, type ErrorResponse, TodosService } from '../api/generated'

export function useTodoAPI() {
  const addTodoItem = useCallback(async (title: string) => {
    return TodosService.create({ title }).catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  const getAllTodoItems = useCallback(async () => {
    return TodosService.getAll().catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  const toggleTodoItem = useCallback(async (todo: AddTodoResponse) => {
    return TodosService.updateById(todo.id, {
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
    return TodosService.deleteById(todo.id).catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  return { addTodoItem, getAllTodoItems, toggleTodoItem, removeTodoItem }
}
