import { getRouteApi } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import { useTodos } from '../../api'
import type { TodoStatusFilter } from './components/TodosFilter/TodosFilter.types'
import { filterTodosByStatus } from './TodosPage.utils'

// Bound at the top of the file — `getRouteApi` returns a typed accessor
// for the route's `validateSearch` schema and loader data.
const todosRoute = getRouteApi('/todos')

/**
 * Owns the `?status=` URL state and exposes the filtered todo list to
 * the route component. Keeps the page itself a pure composition.
 *
 * URL writes go through `useNavigate({ from: '/todos' })`; passing the
 * same default value back (`'all'`) is fine — TanStack Router does not
 * write defaulted keys to the URL, so we never end up with `?status=all`.
 */
export const useTodosFilter = () => {
  const { data: todos } = useTodos()
  const { status } = todosRoute.useSearch()
  const navigate = todosRoute.useNavigate()

  const visibleTodos = useMemo(() => filterTodosByStatus(todos, status), [todos, status])
  const completedCount = useMemo(() => todos.filter((t) => t.is_completed).length, [todos])

  // Stable identity so memoised consumers (TodosFilter) don't re-render
  // when their parent does for unrelated reasons.
  const setStatusFilter = useCallback(
    (next: TodoStatusFilter) => {
      navigate({
        // `replace: true` keeps filter changes out of the back-button
        // history — switching tabs is not a navigation event.
        replace: true,
        search: (prev) => ({ ...prev, status: next }),
      })
    },
    [navigate]
  )

  return {
    status: status as TodoStatusFilter,
    setStatusFilter,
    visibleTodos,
    totalCount: todos.length,
    completedCount,
  }
}
