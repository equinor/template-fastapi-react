import { AxiosError } from 'axios'
import { useCallback, useContext, useMemo } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { AddTodoResponse, ErrorResponse } from '../api/generated'
import TodoAPI from '../api/TodoAPI'

export function useTodoAPI() {
  const { token } = useContext(AuthContext)
  const todoAPI = useMemo(() => new TodoAPI(token), [token])

  const addTodo = useCallback(
    (title: string) => {
      const todo = todoAPI
        .create({ addTodoRequest: { title: title } })
        .then((response) => response.data)
        .catch((error: AxiosError<ErrorResponse>) => {
          throw new Error(error.message)
        })
      return todo
    },
    [todoAPI]
  )

  const getAllTodos = useCallback(() => {
    const todos = todoAPI
      .getAll()
      .then((response) => response.data)
      .catch((error: AxiosError<ErrorResponse>) => {
        throw new Error(error.message)
      })
    return todos
  }, [todoAPI])

  const toggleTodo = useCallback(
    async (todo: AddTodoResponse) => {
      todoAPI
        .updateById({
          id: todo.id,
          updateTodoRequest: {
            is_completed: !todo.is_completed,
            title: todo.title,
          },
        })
        .catch((error: AxiosError<ErrorResponse>) => {
          throw new Error(error.message)
        })
    },
    [todoAPI]
  )

  const removeTodo = useCallback(
    async (todo: AddTodoResponse) => {
      todoAPI
        .deleteById({ id: todo.id })
        .catch((error: AxiosError<ErrorResponse>) => {
          throw new Error(error.message)
        })
    },
    [todoAPI]
  )

  return { todoAPI, addTodo, getAllTodos, toggleTodo, removeTodo }
}
