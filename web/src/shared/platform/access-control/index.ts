// Public barrel. Deep imports are blocked by `no-restricted-imports`
// in eslint.config.mts.
export { createHasPermission, createIsAllowed } from './access-control'
export type {
  HasPermission,
  IsAllowed,
  PermissionAction,
  PermissionCheck,
  PermissionData,
  PermissionMap,
  RolesWithPermissions,
  UserWithRoles,
} from './types'
