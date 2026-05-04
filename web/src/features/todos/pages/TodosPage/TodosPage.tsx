import { Button, Typography } from '@equinor/eds-core-react'
import { FeatureFlagName } from '@/config/featureFlags'
import { useClearCompletedTodos } from '@/features/todos/api'
import { FeatureToggle } from '@/shared/platform/feature-flags/FeatureToggle'
import { NewTodoForm } from './components/NewTodoForm'
import { TodoList } from './components/TodoList'
import { TodosFilter } from './components/TodosFilter'
import { useTodosFilter } from './TodosPage.hooks'

/**
 * Route component. Composition only: the data fetch + URL-state +
 * filtering live in `useTodosFilter`; this file just wires hooks to
 * presentational children.
 *
 * The create form is hidden behind a feature flag — demonstrates the
 * `<FeatureToggle>` wiring; flip `NEW_TODO_FORM` in `featureFlags.ts`.
 */
export const TodosPage = () => {
  const { status, setStatusFilter, visibleTodos, totalCount, completedCount } = useTodosFilter()
  const clearCompleted = useClearCompletedTodos()

  // Empty state has two flavours: a fresh list ("add your first") vs a
  // filter that hides everything ("no <status> todos"). The user needs
  // different next steps in each case.
  const emptyMessage =
    totalCount === 0
      ? 'No todos yet — add your first one above.'
      : status === 'done'
        ? 'No completed todos yet.'
        : status === 'active'
          ? 'Nothing to do — well done!'
          : 'No todos match this filter.'

  return (
    <div className="flex flex-col gap-lg">
      <header className="flex items-baseline justify-between">
        <Typography variant="h2">My todos</Typography>
        <Typography variant="body_short" className="text-muted">
          {visibleTodos.length} {visibleTodos.length === 1 ? 'item' : 'items'}
        </Typography>
      </header>

      <FeatureToggle featureFlag={FeatureFlagName.NEW_TODO_FORM}>
        <section className="p-lg bg-surface rounded-card shadow-card border border-border">
          <NewTodoForm />
        </section>
      </FeatureToggle>

      <div className="flex items-center justify-center gap-md">
        <TodosFilter value={status} onChange={setStatusFilter} />
        {completedCount > 0 && (
          <Button variant="ghost" onClick={() => clearCompleted.mutate()} disabled={clearCompleted.isPending}>
            {`Clear completed (${completedCount})`}
          </Button>
        )}
      </div>

      {/* aria-busy lets screen readers announce the bulk operation;
       *  visual feedback is handled per-item by TodoItem. */}
      <div aria-busy={clearCompleted.isPending}>
        <TodoList todos={visibleTodos} emptyMessage={emptyMessage} />
      </div>
    </div>
  )
}
