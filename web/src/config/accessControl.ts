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
 *   - `isAllowed(user, resource, action, data?)` — strict-boolean
 *     variant for components and tests; `'loading'` collapses to
 *     `false`.
 *
 * Leaf-shaped on purpose (no React, no auth imports beyond the
 * type-only `CurrentUser`) so it can be safely imported from anywhere
 * including `userQuery`.
 *
 * To add a role: extend the `Role` union, give it an entry in `ROLES`,
 * and make sure the backend (`/whoami`) emits the matching string in
 * its `roles` array. Unknown role strings are silently ignored.
 */

import type { Todo } from '@/features/todos'
import { createHasPermission, createIsAllowed, type RolesWithPermissions } from '@/shared/platform/access-control'
import type { CurrentUser } from '@/shared/platform/auth'

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export type Role = 'admin' | 'editor' | 'viewer'

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export type Permissions = {
  todos: {
    dataType: Todo | null
    action: 'read' | 'create' | 'update' | 'delete'
  }
}

/** True iff `todo` exists and its `user_id` matches the current user. */
const isOwnTodo = (user: CurrentUser, todo: Todo | null): boolean => todo != null && todo.user_id === user.id

// ---------------------------------------------------------------------------
// Roles → permissions table
// ---------------------------------------------------------------------------

export const ROLES: RolesWithPermissions<Role, Permissions, CurrentUser> = {
  admin: {
    todos: { read: true, create: true, update: true, delete: true },
  },
  editor: {
    todos: {
      read: true,
      create: true,
      // Editors may only modify todos they own.
      update: isOwnTodo,
      delete: isOwnTodo,
    },
  },
  viewer: {
    todos: { read: true, create: false, update: false, delete: false },
  },
}

/**
 * Singleton check bound to {@link ROLES}. Loader call sites (`*.route.ts`)
 * call this directly and throw a 403 `Response` — caught by
 * `RouteErrorBoundary` → `<ForbiddenPage />`.
 */
export const hasPermissionCheck = createHasPermission<Role, Permissions, CurrentUser>(ROLES)

/**
 * Strict-boolean variant of {@link hasPermissionCheck}: `'loading'`
 * collapses to `false`. Prefer this in components and tests; loaders
 * should keep using `hasPermissionCheck` so they can distinguish
 * `'loading'` from a real deny if needed.
 */
export const isAllowed = createIsAllowed<Permissions, CurrentUser>(hasPermissionCheck)
