/**
 * App-wired access control tests. Covers the editor ownership predicate
 * which the generic factory tests don't exercise (those use a synthetic
 * Doc type). Pin the false branches so a regression silently granting
 * cross-user edits would fail here.
 */

import { describe, expect, test } from 'vitest'
import type { Todo } from '@/features/todos/api'
import type { CurrentUser } from '@/shared/platform/auth/auth'
import { hasPermissionCheck } from './accessControl'

const editor = (id: string): CurrentUser => ({
  id,
  name: 'E',
  roles: ['editor'],
})
const admin = (id: string): CurrentUser => ({
  id,
  name: 'A',
  roles: ['admin'],
})
const viewer = (id: string): CurrentUser => ({
  id,
  name: 'V',
  roles: ['viewer'],
})

const todoOwnedBy = (ownerId: string): Todo => ({
  id: 't1',
  title: 'T',
  is_completed: false,
  // Cast: the API doesn't expose `owner_id` yet, mirroring `accessControl.ts`.
  ...({ owner_id: ownerId } as object),
})

describe('hasPermissionCheck — editor ownership', () => {
  test('editor can update their own todo', () => {
    expect(hasPermissionCheck(editor('u1'), 'todos', 'update', todoOwnedBy('u1'))).toBe(true)
  })

  test("editor cannot update someone else's todo", () => {
    expect(hasPermissionCheck(editor('u1'), 'todos', 'update', todoOwnedBy('u2'))).toBe(false)
  })

  test('editor cannot delete a todo with no owner_id', () => {
    const orphan: Todo = { id: 't1', title: 'T', is_completed: false }
    expect(hasPermissionCheck(editor('u1'), 'todos', 'delete', orphan)).toBe(false)
  })

  test('editor cannot delete a null todo', () => {
    expect(hasPermissionCheck(editor('u1'), 'todos', 'delete', null)).toBe(false)
  })

  test('editor can always create + read', () => {
    expect(hasPermissionCheck(editor('u1'), 'todos', 'create')).toBe(true)
    expect(hasPermissionCheck(editor('u1'), 'todos', 'read')).toBe(true)
  })
})

describe('hasPermissionCheck — admin / viewer', () => {
  test('admin can update any todo regardless of owner', () => {
    expect(hasPermissionCheck(admin('u1'), 'todos', 'update', todoOwnedBy('u2'))).toBe(true)
    expect(hasPermissionCheck(admin('u1'), 'todos', 'delete', null)).toBe(true)
  })

  test('viewer can only read', () => {
    const v = viewer('u1')
    expect(hasPermissionCheck(v, 'todos', 'read')).toBe(true)
    expect(hasPermissionCheck(v, 'todos', 'create')).toBe(false)
    expect(hasPermissionCheck(v, 'todos', 'update', todoOwnedBy('u1'))).toBe(false)
    expect(hasPermissionCheck(v, 'todos', 'delete', todoOwnedBy('u1'))).toBe(false)
  })
})
