import { type ApiError, isApiError } from '../../platform/api'

export const titleFor = (error: unknown): string => {
  if (!isApiError(error)) return 'Something went wrong'
  switch (error.kind) {
    case 'network':
      return 'Network error'
    case 'parse':
      return 'Unexpected response from server'
    case 'http':
      if (error.status === 403) return 'Not allowed'
      if (error.status === 404) return 'Not found'
      if (error.status >= 500) return 'Server error'
      return `Request failed (${error.status})`
  }
}

export const messageFor = (error: unknown): string => {
  if (isApiError(error)) return error.message
  if (error instanceof Response) return `${error.status} ${error.statusText || 'Error'}`.trim()
  if (error instanceof Error) return error.message
  if (error == null) return 'Unknown error'
  return String(error)
}

export const traceIdFor = (error: unknown): string | null => (isApiError(error) ? (error as ApiError).traceId : null)
