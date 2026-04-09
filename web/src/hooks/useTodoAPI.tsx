import { useCallback } from 'react'
import type { AddTodoResponse, ErrorResponse } from '../api/generated'
import { createTodo, deleteTodoById, getAllTodos, updateTodoById } from '../api/generated'
import { useTodos } from '../contexts/TodoContext'

function handleError(error: unknown): void {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    console.error((error as ErrorResponse).message)
  } else {
    console.error(error)
  }
  throw error
}

export function useTodoAPI() {
  const { dispatch } = useTodos()

  const addTodoItem = useCallback(async (title: string) => {
    try {
      const { data: todoItem } = await createTodo({
        body: { title },
        throwOnError: true,
      })
      dispatch({ type: 'ADD_TODO', payload: todoItem })
      return todoItem
    } catch (error) {
      handleError(error)
    }
  }, [])

  const getAllTodoItems = useCallback(async () => {
    try {
      const { data: todoItems } = await getAllTodos({
        throwOnError: true,
      })
      dispatch({ type: 'INITIALIZE', payload: todoItems })
      return todoItems
    } catch (error) {
      handleError(error)
    }
  }, [])

  const toggleTodoItem = useCallback(async (todoItem: AddTodoResponse) => {
    try {
      await updateTodoById({
        path: { id: todoItem.id },
        body: {
          is_completed: !todoItem.is_completed,
          title: todoItem.title,
        },
        throwOnError: true,
      })
      dispatch({ type: 'TOGGLE_TODO', payload: todoItem })
    } catch (error) {
      handleError(error)
    }
  }, [])

  const removeTodoItem = useCallback(async (todoItem: AddTodoResponse) => {
    try {
      await deleteTodoById({
        path: { id: todoItem.id },
        throwOnError: true,
      })
      dispatch({ type: 'REMOVE_TODO', payload: todoItem })
    } catch (error) {
      handleError(error)
    }
  }, [])

  return { addTodoItem, getAllTodoItems, toggleTodoItem, removeTodoItem }
}
