import { Button } from '@equinor/eds-core-react'
import { FeatureFlagName } from '@/config/featureFlags'
import { useClearCompletedTodos } from '@/features/todos/api'
import { PageHeader } from '@/shared/components/PageHeader/PageHeader'
import { FeatureToggle } from '@/shared/platform/feature-flags'
import { NewTodoForm } from './components/NewTodoForm/NewTodoForm'
import { TodoList } from './components/TodoList/TodoList'
import { TodosFilter } from './components/TodosFilter/TodosFilter'
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
      <PageHeader title="My todos" meta={`${visibleTodos.length} ${visibleTodos.length === 1 ? 'item' : 'items'}`} />

      <FeatureToggle featureFlag={FeatureFlagName.NEW_TODO_FORM}>
        <section className="p-lg bg-surface rounded-card shadow-card border border-border">
          <NewTodoForm />
        </section>
      </FeatureToggle>

      <div className="flex items-center justify-center gap-md">
        <TodosFilter value={status} onChange={setStatusFilter} />
        {/* Role-gated example: `BULK_TOOLS` is admin-only (see featureFlags.ts).
         *  The flag is the gate; permission is still enforced server-side. */}
        <FeatureToggle featureFlag={FeatureFlagName.BULK_TOOLS}>
          {completedCount > 0 && (
            <Button variant="ghost" onClick={() => clearCompleted.mutate()} disabled={clearCompleted.isPending}>
              {`Clear completed (${completedCount})`}
            </Button>
          )}
        </FeatureToggle>
      </div>

      {/* aria-busy lets screen readers announce the bulk operation;
       *  visual feedback is handled per-item by TodoItem. */}
      <div aria-busy={clearCompleted.isPending}>
        <TodoList todos={visibleTodos} emptyMessage={emptyMessage} />
      </div>
    </div>
  )
}
