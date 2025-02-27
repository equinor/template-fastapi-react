import { useCallback } from 'react'
import { type AddTodoResponse, ApiError, type ErrorResponse, TodoService } from '../api/generated'
import { useTodos } from '../contexts/TodoContext'

function handleError(error: unknown): void {
  if (error instanceof ApiError) {
    console.error((error.body as ErrorResponse).message)
  }
  throw error
}

export function useTodoAPI() {
  const { dispatch } = useTodos()

  const addTodoItem = useCallback(async (title: string) => {
    try {
      const todoItem = await TodoService.create({ title })
      dispatch({ type: 'ADD_TODO', payload: todoItem })
      return todoItem
    } catch (error) {
      handleError(error)
    }
  }, [])

  const getAllTodoItems = useCallback(async () => {
    try {
      const todoItems = await TodoService.getAll()
      dispatch({ type: 'INITIALIZE', payload: todoItems })
      return todoItems
    } catch (error) {
      handleError(error)
    }
  }, [])

  const toggleTodoItem = useCallback(async (todoItem: AddTodoResponse) => {
    try {
      await TodoService.updateById(todoItem.id, {
        is_completed: !todoItem.is_completed,
        title: todoItem.title,
      })
      dispatch({ type: 'TOGGLE_TODO', payload: todoItem })
    } catch (error) {
      handleError(error)
    }
  }, [])

  const removeTodoItem = useCallback(async (todoItem: AddTodoResponse) => {
    try {
      await TodoService.deleteById(todoItem.id)
      dispatch({ type: 'REMOVE_TODO', payload: todoItem })
    } catch (error) {
      handleError(error)
    }
  }, [])

  return { addTodoItem, getAllTodoItems, toggleTodoItem, removeTodoItem }
}
