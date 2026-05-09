// Wires the generated SDK client to a single shared `fetch` funnel that
// adds tracing, timeout, 401 latching, and error normalisation.
// `configureApiClient({ telemetry })` runs once at boot from
// `src/index.tsx` (and `setupTests.ts` in Vitest) before the router is
// constructed, since route loaders fire eagerly.
//
// Auth is mediated by oauth2-proxy (the BFF). The browser carries the
// session as an HttpOnly cookie that nginx forwards along with every
// request, and oauth2-proxy injects `Authorization` /
// `X-Forwarded-Access-Token` upstream. There is no bearer token in JS
// — do not set the `authorization` header here, and do not call
// `client.setConfig({ auth })`.
//
// Telemetry: failed requests emit low-noise `http.error` events, *not*
// exceptions. Exceptions are reserved for the route boundary and the
// top-level React error boundary so a single user-visible failure shows
// up exactly once in App Insights instead of three times.

import { client } from '@/api-generated/client.gen'
import { sessionExpiredStore } from '../auth/reauth/sessionExpiredStore'
import type { Telemetry } from '../telemetry'
import type { ApiError } from './types'

// Default per-request timeout. Long enough for slow back-ends behind
// cold-start, short enough that the UI doesn't appear to hang. Override
// by passing a custom `init.signal` for calls that legitimately need
// longer (e.g. large uploads).
const DEFAULT_TIMEOUT_MS = 30_000

// HTTP statuses that may legitimately have no body / no JSON content-type.
const EMPTY_BODY_STATUSES = new Set([204, 205, 304])

const createHttpClient = (telemetry: Telemetry): typeof fetch => {
  const reportHttpError = (err: ApiError, ctx: Record<string, unknown>) => {
    telemetry.trackEvent('http.error', {
      kind: err.kind,
      traceId: err.traceId,
      ...(err.kind === 'http' ? { status: String(err.status) } : {}),
      ...ctx,
    })
  }

  /** Report `err` as telemetry, then throw it. Never returns. */
  const fail = (err: ApiError, ctx: Record<string, unknown>): never => {
    reportHttpError(err, ctx)
    throw err
  }

  return async (input, init = {}) => {
    const traceId = crypto.randomUUID()
    const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined))
    headers.set('x-trace-id', traceId)

    const url = input instanceof Request ? input.url : input instanceof URL ? input.href : String(input)

    // Compose a timeout signal with any caller-supplied signal (React
    // Query passes one to abort in-flight requests on unmount/refetch).
    // Whichever aborts first wins.
    const callerSignal = init.signal ?? (input instanceof Request ? input.signal : undefined)
    const timeoutSignal = AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
    const signal = callerSignal ? AbortSignal.any([callerSignal, timeoutSignal]) : timeoutSignal

    let res: Response
    try {
      res = await fetch(input, { ...init, headers, credentials: 'include', signal })
    } catch (e) {
      // `AbortSignal.timeout` rejects with `TimeoutError`; a caller-aborted
      // fetch rejects with `AbortError`. Normalise both into `network`
      // errors with a descriptive message so the toast/error panel renders
      // something useful instead of a cryptic "fetch failed".
      const isTimeout = e instanceof DOMException && e.name === 'TimeoutError'
      const isAbort = e instanceof DOMException && e.name === 'AbortError'
      const message = isTimeout
        ? `Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s`
        : isAbort
          ? 'Request aborted'
          : e instanceof Error
            ? e.message
            : 'network error'
      throw fail(
        { kind: 'network', traceId, message },
        { url, ...(isTimeout ? { reason: 'timeout' } : isAbort ? { reason: 'abort' } : {}) }
      )
    }

    if (!res.ok) {
      if (res.status === 401) {
        // Latch a module-level flag — `<SessionExpiredDialog>` reads it on
        // mount so a 401 raised from a router loader (which runs *before*
        // React mounts) is not lost.
        sessionExpiredStore.notify()
      }
      throw fail(
        {
          kind: 'http',
          status: res.status,
          traceId,
          message: res.status === 401 ? 'unauthorized' : res.statusText || `HTTP ${res.status}`,
        },
        { url }
      )
    }

    // Non-JSON 2xx usually means the request never reached the API
    // (Vite SPA fallback, misconfigured proxy → text/html on 200).
    // Surfacing it here as a clean ApiError beats a cryptic parse
    // failure deep inside the generated client.
    if (!EMPTY_BODY_STATUSES.has(res.status)) {
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('json')) {
        throw fail(
          {
            kind: 'parse',
            traceId,
            message: `Expected JSON from ${url} but got ${contentType || 'no content-type'}.`,
          },
          { url, contentType }
        )
      }
    }

    return res
  }
}

export const configureApiClient = ({ telemetry }: { telemetry: Telemetry }) => {
  // Tests run under MSW: the handlers in `mocks/handlers/` are registered
  // against `http://localhost` (no `/api` prefix) so the SDK's resolved
  // request URL must match. In the browser, requests go through Vite /
  // the dev proxy under `/api`.
  const isTest = typeof import.meta.env !== 'undefined' && import.meta.env.MODE === 'test'

  client.setConfig({
    baseUrl: isTest ? 'http://localhost' : `${window.location.origin}/api`,
    fetch: createHttpClient(telemetry),
  })
}
