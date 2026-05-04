/**
 * Generic role-based access control factory. Lifted from CoreDM —
 * see `CoreDM/web/src/common/access-control/access-control.ts`.
 *
 * Two layers:
 *   - **Permissions map**: a typed config of resources → actions, with the
 *     associated `dataType` for the entity being checked. Defined per app
 *     in `src/accessControl.ts`.
 *   - **Roles config**: per role, per resource, per action: either a
 *     boolean, or a predicate `(user, data) => boolean` for ownership /
 *     data-aware checks (e.g. "owner can delete their own todo").
 *
 * `createHasPermission(roles)` returns the runtime checker:
 *   `(user, resource, action, data?) => boolean | 'loading'`
 * — `'loading'` is returned when the user object isn't hydrated yet so
 * UIs can avoid flashing "denied" before auth resolves.
 */

type PermissionMap = Record<
  string,
  {
    dataType: unknown
    action: string | number | symbol
  }
>

export type PermissionAction<P extends PermissionMap, Key extends keyof P> = P[Key]['action']
export type PermissionData<P extends PermissionMap, Key extends keyof P> = P[Key]['dataType']

export type PermissionCheck<P extends PermissionMap, Key extends keyof P, User> =
  | boolean
  | ((user: User, data: PermissionData<P, Key>) => boolean)

export type RolesWithPermissions<Role extends string, P extends PermissionMap, User> = {
  [R in Role]?: {
    [Key in keyof P]?: {
      [Action in PermissionAction<P, Key>]?: PermissionCheck<P, Key, User>
    }
  }
}

export type HasPermission<P extends PermissionMap, User> = <Key extends keyof P>(
  user: User | undefined | null,
  resource: Key,
  action: PermissionAction<P, Key>,
  data?: PermissionData<P, Key>
) => boolean | 'loading'

type UserWithRoles = { id: string; roles?: readonly string[] }

export const createHasPermission = <Role extends string, P extends PermissionMap, User extends UserWithRoles>(
  rolesConfig: RolesWithPermissions<Role, P, User>
): HasPermission<P, User> => {
  return (user, resource, action, data) => {
    if (!user?.id) return 'loading'

    return (user.roles ?? []).some((role) => {
      const permission = rolesConfig[role as Role]?.[resource]?.[action]
      if (typeof permission === 'boolean') return permission
      if (typeof permission === 'function') {
        // biome-ignore lint/suspicious/noExplicitAny: permission narrowing across a generic union
        return (permission as any)(user, data ?? {})
      }
      return false
    })
  }
}
