/**
 * Unit tests for the generic permission factory. Validates:
 *   - boolean rule lookup
 *   - predicate rule with ownership data
 *   - `'loading'` short-circuit when user is missing/unhydrated
 *   - multiple roles merge to most-permissive
 *   - unknown role / resource / action returns false
 *   - predicate called without data is denied (and warns in DEV)
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createHasPermission } from './access-control'
import type { RolesWithPermissions } from './types'

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
    expect(check(undefined, 'docs', 'read')).toBe('loading')
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

  test('most-permissive across boolean + predicate roles', () => {
    // editor predicate would deny (no ownership), but admin boolean grants.
    const u: User = { id: 'u1', roles: ['editor', 'admin'] }
    expect(check(u, 'docs', 'edit', { id: 'd1', ownerId: 'someone-else' })).toBe(true)
  })

  test('unknown role returns false', () => {
    const u: User = { id: 'u1', roles: ['ghost'] }
    expect(check(u, 'docs', 'read')).toBe(false)
  })

  test('unknown resource / action returns false', () => {
    const u: User = { id: 'u1', roles: ['admin'] }
    // Cast through `unknown`: bypasses the type system to mirror a runtime
    // miswiring (stale role config, dynamic action name, etc.).
    expect(check(u, 'unknown' as unknown as 'docs', 'read')).toBe(false)
    expect(check(u, 'docs', 'unknown' as unknown as 'read')).toBe(false)
  })

  test('user with no roles returns false', () => {
    const u: User = { id: 'u1' }
    expect(check(u, 'docs', 'read')).toBe(false)
  })

  test('user with empty roles array returns false', () => {
    const u: User = { id: 'u1', roles: [] }
    expect(check(u, 'docs', 'read')).toBe(false)
  })

  describe('predicate called without data', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
      warnSpy.mockRestore()
    })

    test('denies and does not invoke the predicate', () => {
      let invoked = false
      const rolesWithSpy: RolesWithPermissions<Role, P, User> = {
        editor: {
          docs: {
            read: true,
            edit: () => {
              invoked = true
              return true
            },
          },
        },
      }
      const checkSpy = createHasPermission<Role, P, User>(rolesWithSpy)
      const u: User = { id: 'u1', roles: ['editor'] }

      expect(checkSpy(u, 'docs', 'edit')).toBe(false)
      expect(invoked).toBe(false)
    })

    test('treats explicit null data as a value (predicate runs)', () => {
      // The factory only short-circuits on `undefined`; `null` is a real
      // payload and must reach the predicate (e.g. "is this *no* todo
      // selected?"). The editor rule denies null via `Boolean(doc)`.
      const u: User = { id: 'u1', roles: ['editor'] }
      expect(check(u, 'docs', 'edit', null)).toBe(false)
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })
})
