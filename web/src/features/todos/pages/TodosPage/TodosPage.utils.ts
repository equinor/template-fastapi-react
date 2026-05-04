import type { Todo } from '../../api'
import type { TodoStatusFilter } from './components/TodosFilter'

/**
 * Pure filter for the todo list. Lives outside the page so it can be
 * unit-tested without React, and reused if another view ever needs the
 * same predicate.
 */
export const filterTodosByStatus = (todos: readonly Todo[], status: TodoStatusFilter): Todo[] => {
  if (status === 'all') return [...todos]
  return todos.filter((todo) => (status === 'done' ? todo.is_completed : !todo.is_completed))
}
