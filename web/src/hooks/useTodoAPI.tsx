import { useContext, useEffect, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import TodoAPI from '../api/TodoAPI'

export function useTodoAPI() {
  const { token } = useContext(AuthContext)
  const [todoAPI, setTodoAPI] = useState<TodoAPI>(new TodoAPI(token))

  useEffect(() => {
    setTodoAPI(new TodoAPI(token))
  }, [token])

  return todoAPI
}
