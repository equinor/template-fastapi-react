/**
 * Catches loader and render errors thrown anywhere inside the route tree.
 * Mounted as the router's `defaultErrorComponent` (see
 * `app/bootstrap/routerDefaults.tsx`), so every route gets its own
 * boundary and the layout stays mounted, and as `errorComponent` on the
 * root route in `routes/__root.tsx`. Logs once via telemetry, then
 * renders the `ErrorPage` that matches the status code (401 → sign-in
 * required, shown under the session-expired dialog; 403/404 → dedicated
 * page; otherwise a generic error page).
 *
 * Client-side 4xx (401/403/404) are skipped by default.
 * 5xx and unexpected throws still report.
 *
 * TanStack Router calls this with the thrown value as the `error` prop
 * (replacement for react-router's `useRouteError()`). The component
 * also serves as `notFoundComponent` — a TSR `NotFoundError` carries
 * no HTTP status, so we treat it as 404 by name check.
 */

import { useEffect, useRef } from 'react'
import { useTelemetry } from '@/shared/platform/telemetry'
import { ErrorPage } from '../ErrorPage/ErrorPage'
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
  if (error === undefined) return <ErrorPage errorCode={404} />

  // 401 renders a sign-in-required page rather than nothing: when the 401
  // came through `httpClient`, the session-expired dialog sits on top of
  // it; otherwise this page is the only feedback the user gets.
  return <ErrorPage errorCode={statusOf(error)} error={error} />
}
