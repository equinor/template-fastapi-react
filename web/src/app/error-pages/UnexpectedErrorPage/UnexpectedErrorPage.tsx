import { ErrorPanel } from '@/shared/components/ErrorPanel/ErrorPanel'
import { GoHomeButton } from '../GoHomeButton/GoHomeButton'
import { StatusPage } from '../StatusPage/StatusPage'

/**
 * Default 5xx / unhandled error surface for the route tree. Receives the
 * raw `useRouteError()` value so it can show traceIds when present.
 */
export const UnexpectedErrorPage = ({ error }: { error: unknown }) => (
  <StatusPage title="Something went wrong" body={<ErrorPanel error={error} />} action={<GoHomeButton />} />
)
