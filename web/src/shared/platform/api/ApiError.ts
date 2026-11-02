import type { ApiError } from './types'

// Type guard — used by the global query/mutation cache and by `<ErrorPanel>`.
// Validates the full shape (not just that `kind`/`traceId` exist) so an
// arbitrary object can't be mistaken for an ApiError and render e.g.
// "Request failed (undefined)" or skip the retry/telemetry rules.
export const isApiError = (e: unknown): e is ApiError => {
  if (typeof e !== 'object' || e === null) return false
  const candidate = e as Record<string, unknown>
  if (typeof candidate.traceId !== 'string' || typeof candidate.message !== 'string') return false
  switch (candidate.kind) {
    case 'network':
    case 'parse':
      return true
    case 'http':
      return typeof candidate.status === 'number'
    default:
      return false
  }
}
