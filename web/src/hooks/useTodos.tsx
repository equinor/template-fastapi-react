import React, { useEffect, useContext, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import TodoAPI from '../api/TodoAPI'
import { AxiosError, AxiosPromise, AxiosResponse } from 'axios'
import { AddTodoResponse, ErrorResponse } from '../api/generated'

type TodoItem = {
  id: string
  title: string
  is_completed: boolean
}

const useTodos = (): [
  AddTodoResponse[],
  boolean,
  (title: string) => void,
  (id: string, index: number) => void,
  (id: string, is_completed: boolean, index: number) => void,
  AxiosError<any> | null
] => {
  const [todos, setTodos] = useState<AddTodoResponse[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<AxiosError<any> | null>(null)
  const { token } = useContext(AuthContext)
  const todoAPI = new TodoAPI(token)

  useEffect(() => {
    setLoading(true)
    todoAPI
      .getAll()
      .then((response) => setTodos(response.data))
      .catch((error: AxiosError) => setError(error))
      .finally(() => setLoading(false))
  }, [])

  const addItem = (title: string) => {
    setLoading(true)
    todoAPI
      .create({
        addTodoRequest: {
          title: title,
        },
      })
      .then((response) => {
        const item: AddTodoResponse = response.data
        setTodos([...todos, item])
      })
      .catch((error: AxiosError<ErrorResponse>) => {
        setError(error)
      })
      .finally(() => setLoading(false))
  }

  const removeItem = (id: string, index: number) => {
    setLoading(true)
    todoAPI
      .deleteById({ id: id })
      .then((response) => {
        const tmpTodos = [...todos]
        tmpTodos.splice(index, 1)
        setTodos(tmpTodos)
      })
      .catch((error: AxiosError) => setError(error))
      .finally(() => setLoading(false))
  }

  const toggleItem = (id: string, is_completed: boolean, index: number) => {
    setLoading(true)
    todoAPI
      .updateById({
        id: id,
        updateTodoRequest: {
          is_completed: !is_completed,
          title: todos[index].title,
        },
      })
      .then((response) => {
        const items = todos
        const item = items[index]
        item.is_completed = !is_completed
        items[index] = item
        setTodos([...items])
      })
      .catch((error: AxiosError) => setError(error))
      .finally(() => setLoading(false))
  }

  return [todos, isLoading, addItem, removeItem, toggleItem, error]
}

export default useTodos
