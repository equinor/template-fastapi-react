import type { TodoStatusFilter } from './TodosFilter.types'

export const OPTIONS: ReadonlyArray<{ value: TodoStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Completed' },
]
