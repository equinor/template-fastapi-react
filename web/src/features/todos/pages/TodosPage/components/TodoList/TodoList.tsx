import { EmptyState } from '@/shared/components/EmptyState/EmptyState'
import { TodoItem } from '../TodoItem/TodoItem'
import type { TodoListProps } from './TodoList.types'

/**
 * Presentational. The page owns the data fetch and passes the list
 * in — keeps this component trivially testable and reusable.
 */
export const TodoList = ({ todos, emptyMessage = 'No todos to show.' }: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <div className="rounded border border-dashed border-border">
        <EmptyState message={emptyMessage} />
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
