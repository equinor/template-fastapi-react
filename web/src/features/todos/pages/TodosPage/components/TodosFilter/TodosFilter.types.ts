export type TodoStatusFilter = 'all' | 'active' | 'done'

export type TodosFilterProps = {
  value: TodoStatusFilter
  onChange: (value: TodoStatusFilter) => void
}
