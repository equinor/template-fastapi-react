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

// Render unknown thrown objects as JSON rather than "[object Object]".
// JSON.stringify throws on circular references and BigInt values, and this
// runs while rendering the error UI itself — a throw here would crash the
// page that is trying to show an error, so it must never throw.
const safeStringify = (value: object): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return Object.prototype.toString.call(value)
  }
}

export const messageFor = (error: unknown): string => {
  if (isApiError(error)) return error.message
  if (error instanceof Response) return `${error.status} ${error.statusText || 'Error'}`.trim()
  if (error instanceof Error) return error.message
  if (error == null) return 'Unknown error'
  if (typeof error === 'object') return safeStringify(error)
  return String(error)
}

export const traceIdFor = (error: unknown): string | null => (isApiError(error) ? (error as ApiError).traceId : null)
