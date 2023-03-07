import { TodoProvider } from '../contexts/TodoContext'
import TodoList from '../features/todos/todo-list/TodoList'

export const TodoListPage = () => {
  return (
    <TodoProvider>
      <TodoList />
    </TodoProvider>
  )
}
