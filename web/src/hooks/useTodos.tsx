import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { TodoItem, ErrorResponse } from '../api/generated'
import { useTodoAPI } from './useTodoAPI'

const useTodos = (): {
  todos: TodoItem[]
  isLoading: boolean
  addItem: (title: string) => void
  removeItem: (id: string) => void
  toggleItem: (id: string) => void
  error: AxiosError<ErrorResponse> | null
} => {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [isLoading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<AxiosError<ErrorResponse> | null>(null)
  const todoAPI = useTodoAPI()

  useEffect(() => {
    setLoading(true)
    todoAPI
      .getAll()
      .then((response) => setTodos(response.data))
      .catch((error: AxiosError<ErrorResponse>) => setError(error))
      .finally(() => setLoading(false))
  }, [todoAPI])

  const addItem = (title: string) => {
    setLoading(true)
    todoAPI
      .create({ title: title })
      .then((response) => {
        const item: TodoItem = response.data
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
      .deleteById(id)
      .then(() => {
        const tmpTodos = todos.filter(
          (todoItem: TodoItem) => todoItem.id !== id
        )
        setTodos(tmpTodos)
      })
      .catch((error: AxiosError<ErrorResponse>) => setError(error))
      .finally(() => setLoading(false))
  }

  const toggleItem = (id: string) => {
    setLoading(true)
    const index: number = todos.findIndex((item: TodoItem) => item.id === id)
    const todoItem = todos[index]
    todoAPI
      .updateById(id, {
        is_completed: !todoItem.is_completed,
        title: todoItem.title,
      })
      .then(() => {
        const items = todos
        todoItem.is_completed = !todoItem.is_completed
        items[index] = todoItem
        setTodos([...items])
      })
      .catch((error: AxiosError<ErrorResponse>) => setError(error))
      .finally(() => setLoading(false))
  }

  return { todos, isLoading, addItem, removeItem, toggleItem, error }
}

export default useTodos
