import { Typography } from '@equinor/eds-core-react'
import { done, remove_outlined, undo } from '@equinor/eds-icons'
import { useRef } from 'react'
import { isAllowed } from '@/config/accessControl'
import { type Todo, useDeleteTodo, useToggleTodo } from '@/features/todos/api'
import { IconButton } from '@/shared/components/IconButton/IconButton'
import { useCurrentUser } from '@/shared/platform/auth'
import { cn } from '@/shared/utils/cn'

export const TodoItem = ({ todo }: { todo: Todo }) => {
  const toggleMutation = useToggleTodo()
  const deleteMutation = useDeleteTodo()
  const rootRef = useRef<HTMLDivElement>(null)

  // UI hint only — server enforces. The root route's `beforeLoad`
  // ensures the user is in cache, so this resolves synchronously.
  const { data: user } = useCurrentUser()
  const canUpdate = isAllowed(user, 'todos', 'update', todo)
  const canDelete = isAllowed(user, 'todos', 'delete', todo)

  // Per-item pending state. The mutation hooks are global, so we identify
  // *which* item is in flight by comparing `variables` to this todo.
  const isToggling = toggleMutation.isPending && toggleMutation.variables?.id === todo.id
  const isDeleting = deleteMutation.isPending && deleteMutation.variables?.path?.id === todo.id
  const isBusy = isToggling || isDeleting

  // After delete, focus would otherwise fall to <body>. Move it to the
  // sibling <li> (next, then previous) so keyboard users keep their place.
  // Computed *before* the mutation fires so the DOM is still intact.
  const handleDelete = () => {
    const li = rootRef.current?.closest('li')
    const target = (li?.nextElementSibling ?? li?.previousElementSibling) as HTMLElement | null
    deleteMutation.mutate(
      { path: { id: todo.id } },
      {
        onSuccess: () => target?.querySelector<HTMLElement>('button')?.focus(),
      }
    )
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'flex items-center gap-md px-md py-sm rounded border border-border bg-surface shadow-card',
        'transition-colors hover:bg-hover',
        todo.is_completed && 'border-l-4 border-l-success',
        isBusy && 'opacity-60'
      )}
    >
      <div className="flex-1 min-w-0">
        <Typography variant="h6" className={todo.is_completed ? 'line-through text-muted' : undefined}>
          {todo.title}
        </Typography>
        <Typography variant="caption" className="text-muted">
          {todo.is_completed ? 'Done' : 'Todo'}
        </Typography>
      </div>
      {canUpdate && (
        <IconButton
          aria-label={`Mark as ${todo.is_completed ? 'todo' : 'done'}`}
          title={`Mark as ${todo.is_completed ? 'todo' : 'done'}`}
          icon={todo.is_completed ? undo : done}
          onClick={() => toggleMutation.mutate(todo)}
          disabled={isBusy}
        />
      )}
      {canDelete && (
        <IconButton
          aria-label={`Remove ${todo.title}`}
          title="Remove"
          icon={remove_outlined}
          onClick={handleDelete}
          disabled={isBusy}
        />
      )}
    </div>
  )
}
