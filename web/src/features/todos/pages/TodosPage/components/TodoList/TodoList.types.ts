import type { Todo } from '@/features/todos/api'

export type TodoListProps = {
  todos: Todo[]
  /** Shown when `todos` is empty. Owner picks the wording for context. */
  emptyMessage?: string
}
