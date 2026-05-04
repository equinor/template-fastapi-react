import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useTodos } from '../../api'
import type { TodoStatusFilter } from './components/TodosFilter'
import { filterTodosByStatus } from './TodosPage.utils'

const statusParser = parseAsStringLiteral(['all', 'active', 'done'] as const).withDefault('all')

/**
 * Owns the `?status=` URL state and exposes the filtered todo list to
 * the route component. Keeps the page itself a pure composition.
 *
 * Pass `null` to the underlying setter when defaulting back to `'all'`
 * so the URL stays clean (no `?status=all`).
 */
export const useTodosFilter = () => {
  const { data: todos } = useTodos()
  const [status, setStatus] = useQueryState('status', statusParser)

  const visibleTodos = useMemo(() => filterTodosByStatus(todos, status), [todos, status])
  const completedCount = useMemo(() => todos.filter((t) => t.is_completed).length, [todos])

  // Stable identity so memoised consumers (TodosFilter) don't re-render
  // when their parent does for unrelated reasons.
  const setStatusFilter = useCallback(
    (next: TodoStatusFilter) => {
      setStatus(next === 'all' ? null : next)
    },
    [setStatus]
  )

  return {
    // `withDefault` guarantees non-null; widen-narrow for downstream consumers
    // who would otherwise need a `?? 'all'` everywhere.
    status: status as TodoStatusFilter,
    setStatusFilter,
    visibleTodos,
    totalCount: todos.length,
    completedCount,
  }
}
