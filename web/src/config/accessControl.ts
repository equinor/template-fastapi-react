/**
 * App-level access control configuration. Mirrors CoreDM's `accessControl.tsx`:
 *   - `Permissions` map declares the resources, allowed actions, and the
 *     data shape that ownership predicates receive.
 *   - `ROLES` table assigns booleans / predicates per role.
 *   - `hasPermissionCheck(user, resource, action, data?)` is the runtime
 *     entry point used by router loaders and UI gates.
 *
 * The roles list is the union you assign to a user via `CurrentUser.roles`.
 * Add a role here, then make sure the backend `/me` endpoint returns it.
 */

import type { Todo } from '@/features/todos/api'
import { createHasPermission, type RolesWithPermissions } from '@/shared/platform/access-control/access-control'
import type { CurrentUser } from '@/shared/platform/auth/auth'

export type Role = 'admin' | 'editor' | 'viewer'

/**
 * The backend doesn't currently expose `owner_id` on `Todo`, so we widen
 * locally for the ownership predicate. Drop this alias once the API
 * surfaces the field on the generated `Todo` type.
 */
type TodoWithOwner = Todo & { owner_id?: string }

export type Permissions = {
  todos: {
    dataType: Todo | null
    action: 'read' | 'create' | 'update' | 'delete'
  }
}

/** True only when `todo` is present and its `owner_id` matches the current user. */
const isOwnTodo = (user: CurrentUser, todo: Todo | null): boolean =>
  todo != null && (todo as TodoWithOwner).owner_id === user.id

export const ROLES: RolesWithPermissions<Role, Permissions, CurrentUser> = {
  admin: {
    todos: {
      read: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  editor: {
    todos: {
      read: true,
      create: true,
      // Editors may only modify todos they own. The backend doesn't
      // currently expose an owner field — extend `Todo` and the API to
      // populate it before flipping this on a real deployment.
      update: isOwnTodo,
      delete: isOwnTodo,
    },
  },
  viewer: {
    todos: {
      read: true,
      create: false,
      update: false,
      delete: false,
    },
  },
}

export const hasPermissionCheck = createHasPermission<Role, Permissions, CurrentUser>(ROLES)
