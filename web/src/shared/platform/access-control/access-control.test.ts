/**
 * Unit tests for the generic permission factory. Validates:
 *   - boolean rule lookup
 *   - predicate rule with ownership data
 *   - `'loading'` short-circuit when user is missing/unhydrated
 *   - multiple roles merge to most-permissive
 *   - unknown role / resource / action returns false
 */

import { describe, expect, test } from 'vitest'
import { createHasPermission, type RolesWithPermissions } from './access-control'

type Role = 'admin' | 'editor' | 'viewer'
type Doc = { id: string; ownerId: string }
type P = {
  docs: { dataType: Doc | null; action: 'read' | 'edit' }
}
type User = { id: string; roles?: readonly string[] }

const ROLES: RolesWithPermissions<Role, P, User> = {
  admin: { docs: { read: true, edit: true } },
  editor: {
    docs: {
      read: true,
      edit: (user, doc) => Boolean(doc) && doc?.ownerId === user.id,
    },
  },
  viewer: { docs: { read: true, edit: false } },
}

const check = createHasPermission<Role, P, User>(ROLES)

describe('createHasPermission', () => {
  test("returns 'loading' when user has no id (unhydrated)", () => {
    expect(check(null, 'docs', 'read')).toBe('loading')
    expect(check({ id: '', roles: ['admin'] }, 'docs', 'read')).toBe('loading')
  })

  test('boolean rule grants/denies', () => {
    const u: User = { id: 'u1', roles: ['viewer'] }
    expect(check(u, 'docs', 'read')).toBe(true)
    expect(check(u, 'docs', 'edit')).toBe(false)
  })

  test('predicate rule receives user + data', () => {
    const u: User = { id: 'u1', roles: ['editor'] }
    expect(check(u, 'docs', 'edit', { id: 'd1', ownerId: 'u1' })).toBe(true)
    expect(check(u, 'docs', 'edit', { id: 'd1', ownerId: 'u2' })).toBe(false)
  })

  test('multiple roles use most-permissive', () => {
    const u: User = { id: 'u1', roles: ['viewer', 'admin'] }
    expect(check(u, 'docs', 'edit')).toBe(true)
  })

  test('unknown role returns false', () => {
    const u: User = { id: 'u1', roles: ['ghost'] }
    expect(check(u, 'docs', 'read')).toBe(false)
  })

  test('user with no roles returns false', () => {
    const u: User = { id: 'u1' }
    expect(check(u, 'docs', 'read')).toBe(false)
  })
})
