import { describe, expect, test } from 'vitest'
import type { Todo } from '../../api'
import { filterTodosByStatus } from './TodosPage.utils'

const todos: Todo[] = [
  { id: '1', user_id: 'u1', title: 'Buy milk', is_completed: false },
  { id: '2', user_id: 'u1', title: 'Walk dog', is_completed: true },
  { id: '3', user_id: 'u1', title: 'Write docs', is_completed: false },
]

describe('filterTodosByStatus', () => {
  test("returns all todos when status is 'all'", () => {
    expect(filterTodosByStatus(todos, 'all')).toHaveLength(3)
  })

  test("returns only incomplete todos when status is 'active'", () => {
    expect(filterTodosByStatus(todos, 'active').map((t) => t.id)).toEqual(['1', '3'])
  })

  test("returns only completed todos when status is 'done'", () => {
    expect(filterTodosByStatus(todos, 'done').map((t) => t.id)).toEqual(['2'])
  })
})
