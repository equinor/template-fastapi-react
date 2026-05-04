/**
 * Single funnel for outbound HTTP errors. Every failure (network /
 * non-2xx / parse) is normalised into one of these three shapes,
 * carrying a traceId for log correlation.
 */
export type ApiError =
  | { kind: 'network'; traceId: string; message: string }
  | { kind: 'http'; status: number; traceId: string; message: string }
  | { kind: 'parse'; traceId: string; message: string }

/** Type guard — used by the global query/mutation cache and by `<ErrorPanel>`. */
export const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' && e !== null && 'kind' in e && 'traceId' in e
