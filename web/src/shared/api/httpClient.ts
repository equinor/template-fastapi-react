/**
 * Single funnel for outbound HTTP. Auth headers, traceIds, 401 redirects,
 * and error normalisation live here — not in feature hooks. Wired into the
 * generated client as its `fetch` option (see `shared/api/apiClient.ts`'s
 * `configureApiClient`).
 *
 * Returns a `Response` (fetch-shaped) — the generated SDK does the parsing,
 * so we don't double-decode JSON.
 *
 * Telemetry: requests are emitted as low-noise `http.error` events, *not*
 * exceptions. Exceptions are reserved for the route boundary and the
 * top-level React error boundary so a single user-visible failure shows
 * up exactly once in App Insights instead of three times.
 */

import { getToken } from '../platform/auth/auth'
import { telemetry } from '../platform/telemetry/telemetry'
import type { ApiError } from './ApiError'
import { SESSION_EXPIRED_EVENT } from './events'

const reportHttpError = (err: ApiError, ctx: Record<string, unknown>) => {
  telemetry.trackEvent('http.error', {
    kind: err.kind,
    traceId: err.traceId,
    ...(err.kind === 'http' ? { status: String(err.status) } : {}),
    ...ctx,
  })
}

export const httpClient: typeof fetch = async (input, init = {}) => {
  const traceId = crypto.randomUUID()
  const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined))
  headers.set('x-trace-id', traceId)
  const token = getToken()
  if (token) headers.set('authorization', `Bearer ${token}`)

  const url = input instanceof Request ? input.url : String(input)

  let res: Response
  try {
    res = await fetch(input, { ...init, headers })
  } catch (e) {
    const err: ApiError = {
      kind: 'network',
      traceId,
      message: e instanceof Error ? e.message : 'network error',
    }
    reportHttpError(err, { url })
    throw err
  }

  if (res.status === 401) {
    // Sibling dialog in AppProviders listens — see SessionExpiredDialog.
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
    const err: ApiError = {
      kind: 'http',
      status: 401,
      traceId,
      message: 'unauthorized',
    }
    reportHttpError(err, { url })
    throw err
  }

  if (!res.ok) {
    const err: ApiError = {
      kind: 'http',
      status: res.status,
      traceId,
      message: res.statusText || `HTTP ${res.status}`,
    }
    reportHttpError(err, { url })
    throw err
  }

  // Non-JSON 2xx usually means the request never reached the API
  // (Vite SPA fallback, misconfigured proxy → text/html on 200).
  // Surfacing it here as a clean ApiError beats a cryptic parse
  // failure deep inside the generated client.
  if (res.status !== 204) {
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('json')) {
      const err: ApiError = {
        kind: 'parse',
        traceId,
        message: `Expected JSON from ${url} but got ${contentType || 'no content-type'}.`,
      }
      reportHttpError(err, { url, contentType })
      throw err
    }
  }

  return res
}
