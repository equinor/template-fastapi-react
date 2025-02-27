import { useCallback } from 'react'
import { type AddTodoResponse, ApiError, type ErrorResponse, TodoService } from '../api/generated'

function handleError(error: unknown): void {
  if (error instanceof ApiError) {
    console.error((error.body as ErrorResponse).message)
  }
  throw error
}

export function useTodoAPI() {
  const addTodoItem = useCallback(async (title: string) => {
    try {
      return await TodoService.create({ title })
    } catch (error) {
      handleError(error)
    }
  }, [])

  const getAllTodoItems = useCallback(async () => {
    try {
      return await TodoService.getAll()
    } catch (error) {
      handleError(error)
    }
  }, [])

  const toggleTodoItem = useCallback(async (todo: AddTodoResponse) => {
    try {
      return await TodoService.updateById(todo.id, {
        is_completed: !todo.is_completed,
        title: todo.title,
      })
    } catch (error) {
      handleError(error)
    }
  }, [])

  const removeTodoItem = useCallback(async (todo: AddTodoResponse) => {
    try {
      return await TodoService.deleteById(todo.id)
    } catch (error) {
      handleError(error)
    }
  }, [])

  return { addTodoItem, getAllTodoItems, toggleTodoItem, removeTodoItem }
}
