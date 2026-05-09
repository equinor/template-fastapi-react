# Access control

Generic role-based access control. The platform module is agnostic of
the app's user shape, role union, and resources: apps wire up their
own `Permissions` map and `ROLES` table and bind a checker via
`createHasPermission`.

## Files

| File | Purpose |
|---|---|
| `types.ts` | Public type vocabulary: `PermissionMap`, `RolesWithPermissions`, `HasPermission`, etc. |
| `access-control.ts` | `createHasPermission(roles)` runtime factory. |
| `index.ts` | Public barrel (deep imports blocked by ESLint). |
| `access-control.test.ts` | Unit tests for the factory. |

## Concepts

- **Permissions map** — typed config of `resource → { action, dataType }`.
  Defined per app (e.g. `src/config/accessControl.ts`). The `dataType`
  is what ownership predicates receive.
- **Roles table** — per role, per resource, per action: either a
  `boolean` or a predicate `(user, data) => boolean` for ownership /
  data-aware checks (e.g. "owner can delete their own todo").
- **Checker** — `createHasPermission(roles)` returns a function:
  `(user, resource, action, data?) => boolean | 'loading'`.

## Wiring (app layer)

`src/config/accessControl.ts`:

```ts
import { createHasPermission, type RolesWithPermissions } from '@/shared/platform/access-control'

export type Role = 'admin' | 'editor' | 'viewer'

export type Permissions = {
  todos: { dataType: Todo | null; action: 'read' | 'create' | 'update' | 'delete' }
}

const isOwnTodo = (user: CurrentUser, todo: Todo | null) =>
  todo != null && todo.user_id === user.id

export const ROLES: RolesWithPermissions<Role, Permissions, CurrentUser> = {
  admin: { todos: { read: true, create: true, update: true, delete: true } },
  editor: { todos: { read: true, create: true, update: isOwnTodo, delete: isOwnTodo } },
  viewer: { todos: { read: true, create: false, update: false, delete: false } },
}

export const hasPermissionCheck = createHasPermission<Role, Permissions, CurrentUser>(ROLES)
export const isAllowed = createIsAllowed<Permissions, CurrentUser>(hasPermissionCheck)
```

## Usage

In components — use `isAllowed` so `'loading'` collapses to `false`:

```tsx
const canDelete = isAllowed(user, 'todos', 'delete', todo)
return canDelete ? <DeleteButton /> : null
```

In a route `beforeLoad` — use `hasPermissionCheck` and throw a 403 caught by `RouteErrorBoundary`:

```ts
beforeLoad: async ({ context }) => {
  const user = await context.queryClient.ensureQueryData(userQuery())
  if (hasPermissionCheck(user, 'todos', 'read') !== true) {
    throw new Response(null, { status: 403 })
  }
}
```

## Semantics

- **Most-permissive wins** across the user's roles. There is no deny
  override — adding `viewer` to an `admin` user does not downgrade
  them.
- **Loading state** — the checker returns `'loading'` until `user.id`
  is set, so UIs can render a skeleton instead of flashing "denied".
- **Predicate without data** — predicates require `data`. Calling a
  predicate-gated action without it returns `false` (and warns in
  DEV).
- **Unknown roles** — silently ignored.

## Adding a resource

1. Add an entry to the app's `Permissions` map with its action union
   and `dataType`.
2. Add per-role entries under `ROLES` for the resource.
3. Call `hasPermissionCheck(user, '<resource>', '<action>', data?)`.

## Testing

The factory is unit-tested in `access-control.test.ts` against a small
synthetic permissions map. App-level wiring is covered separately in
`src/config/accessControl.test.ts`.
