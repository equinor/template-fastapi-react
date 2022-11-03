import React, { useContext } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import TodoList from '../features/todos/todo-list/TodoList'

export const TodoListPage: React.FC = () => {
  const { tokenData, token } = useContext(AuthContext)

  return (
    <>
      <div>Logged in as: {token && tokenData?.['unique_name']}</div>
      <TodoList />
    </>
  )
}
