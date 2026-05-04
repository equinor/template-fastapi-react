/**
 * Declared invalidation contract for todo mutations.
 *
 * Each entry names the cache keys a given mutation must invalidate on
 * success. Mutation factories reference these via `meta.invalidates`,
 * and a single global `MutationCache.onSuccess` handler in
 * `shared/api/queryClient` does the fan-out. Keeping the contract in
 * one file makes the invalidation graph reviewable in a single PR diff
 * and prevents the 'we forgot to invalidate the dashboard' bug class.
 */

import type { QueryKey } from '@tanstack/react-query'
import { todoKeys } from './keys'

export const todoInvalidations = {
  onCreate: (): readonly QueryKey[] => [todoKeys.lists()],
  onToggle: (): readonly QueryKey[] => [todoKeys.lists()],
  onDelete: (): readonly QueryKey[] => [todoKeys.lists()],
} as const
