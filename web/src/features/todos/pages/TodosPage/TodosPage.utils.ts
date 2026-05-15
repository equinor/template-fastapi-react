import type { Todo } from '../../api'
import type { TodoStatusFilter } from './components/TodosFilter/TodosFilter.types'

export const filterTodosByStatus = (todos: readonly Todo[], status: TodoStatusFilter): Todo[] => {
  if (status === 'all') return [...todos]
  return todos.filter((todo) => (status === 'done' ? todo.is_completed : !todo.is_completed))
}
