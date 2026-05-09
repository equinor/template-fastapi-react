import { isApiError } from '@/shared/platform/api'

const isResponse = (e: unknown): e is Response => typeof Response !== 'undefined' && e instanceof Response

export const statusOf = (error: unknown): number | null => {
  if (isResponse(error)) return error.status
  if (isApiError(error) && error.kind === 'http') return error.status
  // TSR's NotFoundError doesn't carry an HTTP status; flag it as 404.
  if (error && typeof error === 'object' && (error as { name?: string }).name === 'NotFoundError') {
    return 404
  }
  return null
}

export const isExpectedClientError = (error: unknown): boolean => {
  const s = statusOf(error)
  return s !== null && s >= 400 && s < 500
}
