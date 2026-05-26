/**
 * `CurrentUser` is the SPA's identity model — kept tiny on purpose,
 * and re-shaped from the generated `/whoami` `User` so the rest of the
 * app sees app-friendly field names (`id`/`name` instead of
 * `user_id`/`full_name`). Permissions are derived from `roles` by
 * `accessControl.ts`, not stored here.
 *
 * `roles` stays as `readonly string[]` rather than the typed `Role`
 * union to keep this module free of `@/config` imports (the access-
 * control compute already ignores unknown role names safely).
 */

export type CurrentUser = {
  id: string
  name: string
  roles: readonly string[]
}
