import { useEffect, useContext, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import TodoAPI from '../api/TodoAPI'
import { AxiosError } from 'axios'
import { AddTodoResponse, ErrorResponse } from '../api/generated'

const useTodos = (): [
  AddTodoResponse[],
  boolean,
  (title: string) => void,
  (id: string) => void,
  (id: string) => void,
  AxiosError | null
] => {
  const [todos, setTodos] = useState<AddTodoResponse[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<AxiosError | null>(null)
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

  const removeItem = (id: string) => {
    setLoading(true)
    todoAPI
      .deleteById({ id: id })
      .then(() => {
        const tmpTodos = todos.filter(
          (todoItem: AddTodoResponse) => todoItem.id !== id
        )
        setTodos(tmpTodos)
      })
      .catch((error: AxiosError) => setError(error))
      .finally(() => setLoading(false))
  }

  const toggleItem = (id: string) => {
    setLoading(true)
    const index: number = todos.findIndex(
      (item: AddTodoResponse) => item.id === id
    )
    const todoItem = todos[index]
    todoAPI
      .updateById({
        id: id,
        updateTodoRequest: {
          is_completed: !todoItem.is_completed,
          title: todoItem.title,
        },
      })
      .then(() => {
        const items = todos
        todoItem.is_completed = !todoItem.is_completed
        items[index] = todoItem
        setTodos([...items])
      })
      .catch((error: AxiosError) => setError(error))
      .finally(() => setLoading(false))
  }

  return [todos, isLoading, addItem, removeItem, toggleItem, error]
}

export default useTodos
