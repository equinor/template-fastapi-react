import type { ApiError } from './types'

// Type guard — used by the global query/mutation cache and by `<ErrorPanel>`.
export const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' && e !== null && 'kind' in e && 'traceId' in e
