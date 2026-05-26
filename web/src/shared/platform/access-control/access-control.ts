import type {
  HasPermission,
  IsAllowed,
  PermissionAction,
  PermissionCheck,
  PermissionData,
  PermissionMap,
  RolesWithPermissions,
  UserWithRoles,
} from './types'

/**
 * createHasPermission is a factory that generates a hasPermission checker based on a provided roles configuration.
 * Returns `'loading'` until `user.id` is populated, so UIs can render a skeleton instead of flashing "denied".
 * @param rolesConfig
 * @returns
 */
export const createHasPermission = <Role extends string, P extends PermissionMap, User extends UserWithRoles>(
  rolesConfig: RolesWithPermissions<Role, P, User>
): HasPermission<P, User> => {
  const compute = <Key extends keyof P>(
    user: User,
    resource: Key,
    action: PermissionAction<P, Key>,
    data: PermissionData<P, Key> | undefined
  ): boolean =>
    (user.roles ?? []).some((role) => {
      const permission: PermissionCheck<P, Key, User> | undefined = rolesConfig[role as Role]?.[resource]?.[action]
      if (typeof permission === 'boolean') return permission
      if (typeof permission === 'function') {
        if (data === undefined) {
          if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
            console.warn(
              `[access-control] Predicate permission for ${String(resource)}.${String(action)} ` +
                `was checked without data; denying. Pass the entity to hasPermission(...).`
            )
          }
          return false
        }
        return permission(user, data)
      }
      return false
    })

  return (user, resource, action, data) => {
    if (!user?.id) return 'loading'
    return compute(user, resource, action, data)
  }
}

/**
 * createIsAllowed
 * Wraps a {@link HasPermission} checker into a strict boolean predicate: 'loading'` collapses to `false`.
 * Use in components and tests so `=== true` boilerplate disappears at every call site.
 *
 * ```ts
 * export const isAllowed = createIsAllowed(hasPermissionCheck)
 * const canDelete = isAllowed(user, 'todos', 'delete', todo)
 * ```
 */
export const createIsAllowed =
  <P extends PermissionMap, User extends UserWithRoles>(check: HasPermission<P, User>): IsAllowed<P, User> =>
  (user, resource, action, data) =>
    check(user, resource, action, data) === true
