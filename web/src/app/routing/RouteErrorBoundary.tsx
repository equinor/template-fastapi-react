/**
 * Catches loader and render errors thrown anywhere inside the route tree.
 * Mounted via `errorElement` on each route in `routing/router.tsx`. Logs once via
 * telemetry, then renders the specialised app-shell page that matches the
 * status code (403/404 → dedicated page, otherwise UnexpectedErrorPage).
 *
 * Client-side 4xx (403/404) are normal navigation outcomes — a user
 * landing on a stale link or hitting a permission gate isn't a bug.
 * Reporting them as exceptions would drown out real failures in App
 * Insights, so they're skipped. 5xx and unexpected throws still report.
 */

import { useEffect, useRef } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { telemetry } from '@/shared/platform/telemetry/telemetry'
import { ForbiddenPage } from './ForbiddenPage'
import { NotFoundPage } from './NotFoundPage'
import { UnexpectedErrorPage } from './UnexpectedErrorPage'

const isExpectedClientError = (error: unknown): boolean =>
  isRouteErrorResponse(error) && error.status >= 400 && error.status < 500

export const RouteErrorBoundary = () => {
  const error = useRouteError()
  // React Strict Mode (and any benign re-render) would otherwise fire
  // telemetry twice for the same error. Identity-compare against the
  // last-reported error so a real second failure still reports.
  const reportedRef = useRef<unknown>(null)

  useEffect(() => {
    if (reportedRef.current === error) return
    reportedRef.current = error
    if (isExpectedClientError(error)) return
    telemetry.trackException(error)
  }, [error])

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />
  if (isRouteErrorResponse(error) && error.status === 403) return <ForbiddenPage />
  return <UnexpectedErrorPage error={error} />
}
