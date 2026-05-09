// Public types for the access-control platform module. Kept separate
// from the runtime so consumers (app config, tests) can import types
// without pulling in the factory.

export type PermissionMap = Record<
  string,
  {
    dataType: unknown
    action: string | number | symbol
  }
>

export type PermissionAction<P extends PermissionMap, Key extends keyof P> = P[Key]['action']
export type PermissionData<P extends PermissionMap, Key extends keyof P> = P[Key]['dataType']

export type UserWithRoles = { id: string; roles?: readonly string[] }

export type PermissionCheck<P extends PermissionMap, Key extends keyof P, User extends UserWithRoles> =
  | boolean
  | ((user: User, data: PermissionData<P, Key>) => boolean)

export type RolesWithPermissions<Role extends string, P extends PermissionMap, User extends UserWithRoles> = {
  [R in Role]?: {
    [Key in keyof P]?: {
      [Action in PermissionAction<P, Key>]?: PermissionCheck<P, Key, User>
    }
  }
}

export type HasPermission<P extends PermissionMap, User extends UserWithRoles> = <Key extends keyof P>(
  user: User | undefined | null,
  resource: Key,
  action: PermissionAction<P, Key>,
  data?: PermissionData<P, Key>
) => boolean | 'loading'

/**
 * Strict-boolean variant of {@link HasPermission}: `'loading'` collapses
 * to `false`. Produced by `createIsAllowed` so call sites don't have to
 * write `=== true` everywhere.
 */
export type IsAllowed<P extends PermissionMap, User extends UserWithRoles> = <Key extends keyof P>(
  user: User | undefined | null,
  resource: Key,
  action: PermissionAction<P, Key>,
  data?: PermissionData<P, Key>
) => boolean
