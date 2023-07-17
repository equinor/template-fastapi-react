import { useCallback } from 'react'
import {
  AddTodoResponse,
  ApiError,
  ErrorResponse,
  TodosService,
} from '../api/generated'

export function useTodoAPI() {
  const addTodo = useCallback(async (title: string) => {
    return TodosService.create({ title }).catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  const getAllTodos = useCallback(async () => {
    return TodosService.getAll().catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  const toggleTodo = useCallback(async (todo: AddTodoResponse) => {
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

  const removeTodo = useCallback(async (todo: AddTodoResponse) => {
    return TodosService.deleteById(todo.id).catch((error) => {
      if (error instanceof ApiError) {
        console.error((error.body as ErrorResponse).message)
      }
      throw error
    })
  }, [])

  return { addTodo, getAllTodos, toggleTodo, removeTodo }
}
