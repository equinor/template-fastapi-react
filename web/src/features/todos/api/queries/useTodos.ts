/**
 * Suspense-driven hook for the todo list. The route loader has already
 * primed the cache via `ensureQueryData(todoListQuery())`, so consumers
 * never see a loading state. Errors propagate to the nearest
 * `errorElement` (RouteErrorBoundary).
 */

import { useSuspenseQuery } from '@tanstack/react-query'
import { todoListQuery } from './todoListQuery'

export const useTodos = () => useSuspenseQuery(todoListQuery())
