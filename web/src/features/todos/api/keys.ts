import { getAllTodosQueryKey } from '@/api-generated/@tanstack/react-query.gen'

/**
 * Single source of truth for todo cache keys.
 *
 * `lists()` aliases the key produced by `@hey-api/openapi-ts`'s TanStack
 * Query plugin so the loader (`ensureQueryData`), the query hooks, and
 * the invalidation contract all reference the *exact* same key.
 * Hand-typing keys here would let them drift the moment the generator's
 * key shape changes.
 */
export const todoKeys = {
  lists: () => getAllTodosQueryKey(),
} as const
