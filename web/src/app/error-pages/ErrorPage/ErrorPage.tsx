import { ErrorPanel } from '@/shared/components/ErrorPanel/ErrorPanel'
import { StatusPanel } from '../components/StatusPanel/StatusPanel'

type ErrorPageProps = {
  errorCode: number | null
  error?: unknown
}

export function ErrorPage(props: ErrorPageProps) {
  function getErrorTitle(code: number | null): string {
    const errorTitles: Record<number, string> = {
      403: 'Forbidden',
      404: 'Not Found',
    }
    return code && errorTitles[code] ? errorTitles[code] : 'Something went wrong'
  }

  function getErrorBody(code: number | null): string | React.ReactNode {
    const errorBodies: Record<number, string> = {
      403: "You don't have permission to view this page.",
      404: "The page you're looking for can't be found. It might have been removed, renamed, or is temporarily unavailable.",
    }
    return code && errorBodies[code] ? errorBodies[code] : <ErrorPanel error={props.error} />
  }

  return (
    <StatusPanel
      errorCode={props.errorCode ?? undefined}
      title={getErrorTitle(props.errorCode)}
      body={getErrorBody(props.errorCode)}
    />
  )
}
