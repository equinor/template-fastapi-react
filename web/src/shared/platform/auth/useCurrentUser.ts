/**
 * `useCurrentUser()` — React hook reading the cached user identity.
 *
 * Uses `useSuspenseQuery`: the root route's `beforeLoad` ensures the
 * user query is in cache before any component mounts, so the read
 * always resolves synchronously and `data` is non-nullable.
 */

import { useSuspenseQuery } from '@tanstack/react-query'
import { userQuery } from './userQuery'

export const useCurrentUser = () => useSuspenseQuery(userQuery())
