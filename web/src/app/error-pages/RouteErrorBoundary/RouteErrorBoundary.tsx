/**
 * Catches loader and render errors thrown anywhere inside the route tree.
 * Mounted via `errorComponent` on the root route in `routes/__root.tsx`.
 * Logs once via telemetry, then renders the specialised app-shell page
 * that matches the status code (401 → quiet fallback under the
 * session-expired dialog, 403/404 → dedicated page, otherwise
 * UnexpectedErrorPage).
 *
 * Client-side 4xx (401/403/404) are normal navigation outcomes — a user
 * landing on a stale link or hitting a permission gate isn't a bug.
 * Reporting them as exceptions would drown out real failures in App
 * Insights, so they're skipped. 5xx and unexpected throws still report.
 *
 * TanStack Router calls this with the thrown value as the `error` prop
 * (replacement for react-router's `useRouteError()`). The component
 * also serves as `notFoundComponent` — a TSR `NotFoundError` carries
 * no HTTP status, so we treat it as 404 by name check.
 */

import { useEffect, useRef } from 'react'
import { useTelemetry } from '@/shared/platform/telemetry'
import { ForbiddenPage } from '../ForbiddenPage/ForbiddenPage'
import { NotFoundPage } from '../NotFoundPage/NotFoundPage'
import { UnexpectedErrorPage } from '../UnexpectedErrorPage/UnexpectedErrorPage'
import { isExpectedClientError, statusOf } from './RouteErrorBoundary.utils'

interface RouteErrorBoundaryProps {
  // TSR passes the thrown value here. Optional so the same component
  // can also serve as `notFoundComponent` (called without props).
  error?: unknown
}

export const RouteErrorBoundary = ({ error }: RouteErrorBoundaryProps = {}) => {
  const telemetry = useTelemetry()
  // React Strict Mode (and any benign re-render) would otherwise fire
  // telemetry twice for the same error. Identity-compare against the
  // last-reported error so a real second failure still reports.
  const reportedRef = useRef<unknown>(null)

  useEffect(() => {
    if (reportedRef.current === error) return
    reportedRef.current = error
    if (error === undefined) return
    if (isExpectedClientError(error)) return
    telemetry.trackException(error)
  }, [error, telemetry])

  // Called as `notFoundComponent` (no error) → render 404.
  if (error === undefined) return <NotFoundPage />

  const status = statusOf(error)
  // 401: `httpClient` already latched `sessionExpiredStore`, so
  // `<SessionExpiredDialog>` is open over us with its own dimmed
  // backdrop and call-to-action. Render nothing here — a spinner or
  // chrome behind the dialog would either lie ("signing in…" before
  // the user clicks) or flash unrelated UI for a frame.
  if (status === 401) return null
  if (status === 404) return <NotFoundPage />
  if (status === 403) return <ForbiddenPage />
  return <UnexpectedErrorPage error={error} />
}
