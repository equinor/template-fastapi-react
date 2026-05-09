/**
 * In-memory database used by MSW handlers. Reset between tests by
 * `setupTests.ts`.
 */

import type { AddTodoResponse } from '../api-generated'

type Db = {
  todos: AddTodoResponse[]
}

export const db: Db = {
  todos: [],
}

export const resetDb = () => {
  db.todos = []
}
