/**
 * App-level access control configuration.
 *
 * Exports:
 *   - `Role` — the SPA's role union.
 *   - `Permissions` — typed map of resources → allowed actions and the
 *     data shape that ownership predicates receive.
 *   - `ROLES` — per-role rules (boolean or predicate) for each action.
 *   - `hasPermissionCheck(user, resource, action, data?)` — the bound
 *     checker. Returns `boolean | 'loading'`. Used from route
 *     `beforeLoad` (throws a 403 `Response`).
 *   - `isAllowed(user, resource, action, data?)` — Strict-boolean variant of {@link hasPermissionCheck}: `
 *     'loading'` collapses to `false`. Prefer this in components and tests; loaders
 *     should keep using `hasPermissionCheck` so they can distinguish`'loading'` from a real deny if needed.
 */

import type { Todo } from '@/features/todos'
import { createHasPermission, createIsAllowed, type RolesWithPermissions } from '@/shared/platform/access-control'
import type { CurrentUser } from '@/shared/platform/auth'

/* Make sure roles stay in sync with the backend's `/whoami`
 * response as unknown role strings are silently ignored.
 */
export type Role = 'admin' | 'editor' | 'viewer'

export type Permissions = {
  todos: {
    dataType: Todo | null
    action: 'read' | 'create' | 'update' | 'delete'
  }
}

const isOwnTodo = (user: CurrentUser, todo: Todo | null): boolean => todo != null && todo.user_id === user.id

export const ROLES: RolesWithPermissions<Role, Permissions, CurrentUser> = {
  admin: {
    todos: { read: true, create: true, update: true, delete: true },
  },
  editor: {
    todos: {
      read: true,
      create: true,
      update: isOwnTodo,
      delete: isOwnTodo,
    },
  },
  viewer: {
    todos: { read: true, create: false, update: false, delete: false },
  },
}

export const hasPermissionCheck = createHasPermission<Role, Permissions, CurrentUser>(ROLES)
export const isAllowed = createIsAllowed<Permissions, CurrentUser>(hasPermissionCheck)
