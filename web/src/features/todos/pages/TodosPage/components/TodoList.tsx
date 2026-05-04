import { Typography } from '@equinor/eds-core-react'
import type { Todo } from '@/features/todos/api'
import { TodoItem } from './TodoItem'

type TodoListProps = {
  todos: Todo[]
  /** Shown when `todos` is empty. Owner picks the wording for context. */
  emptyMessage?: string
}

/**
 * Presentational. The page owns the data fetch and passes the list
 * in — keeps this component trivially testable and reusable.
 */
export const TodoList = ({ todos, emptyMessage = 'No todos to show.' }: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <div className="flex items-center justify-center p-xl rounded-card border border-dashed border-border">
        <Typography variant="body_short" className="text-muted">
          {emptyMessage}
        </Typography>
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-sm list-none p-0 m-0">
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem todo={todo} />
        </li>
      ))}
    </ul>
  )
}
