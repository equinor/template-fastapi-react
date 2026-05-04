/**
 * App-wired access control tests. Covers the editor ownership predicate
 * which the generic factory tests don't exercise (those use a synthetic
 * Doc type). Pin the false branches so a regression silently granting
 * cross-user edits would fail here.
 */

import { describe, expect, test } from 'vitest'
import type { Todo } from '@/features/todos'
import type { CurrentUser } from '@/shared/platform/auth'
import { isAllowed } from './accessControl'

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
  user_id: ownerId,
})

describe('isAllowed — editor ownership', () => {
  test('editor can update their own todo', () => {
    expect(isAllowed(editor('u1'), 'todos', 'update', todoOwnedBy('u1'))).toBe(true)
  })

  test("editor cannot update someone else's todo", () => {
    expect(isAllowed(editor('u1'), 'todos', 'update', todoOwnedBy('u2'))).toBe(false)
  })

  test('editor cannot delete a null todo', () => {
    expect(isAllowed(editor('u1'), 'todos', 'delete', null)).toBe(false)
  })

  test('editor can always create + read', () => {
    expect(isAllowed(editor('u1'), 'todos', 'create')).toBe(true)
    expect(isAllowed(editor('u1'), 'todos', 'read')).toBe(true)
  })
})

describe('isAllowed — admin / viewer', () => {
  test('admin can update any todo regardless of owner', () => {
    expect(isAllowed(admin('u1'), 'todos', 'update', todoOwnedBy('u2'))).toBe(true)
    expect(isAllowed(admin('u1'), 'todos', 'delete', null)).toBe(true)
  })

  test('viewer can only read', () => {
    const v = viewer('u1')
    expect(isAllowed(v, 'todos', 'read')).toBe(true)
    expect(isAllowed(v, 'todos', 'create')).toBe(false)
    expect(isAllowed(v, 'todos', 'update', todoOwnedBy('u1'))).toBe(false)
    expect(isAllowed(v, 'todos', 'delete', todoOwnedBy('u1'))).toBe(false)
  })
})
