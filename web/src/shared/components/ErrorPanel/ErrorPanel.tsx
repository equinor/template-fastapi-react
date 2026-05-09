/**
 * Single rendering surface for `ApiError` (and unknowns). Always shows
 * a `traceId` when available — one paste in the log search reveals the
 * exact request that failed.
 */

import { Icon, Typography } from '@equinor/eds-core-react'
import { error_outlined } from '@equinor/eds-icons'
import { messageFor, titleFor, traceIdFor } from './ErrorPanel.utils'

export const ErrorPanel = ({ error }: { error: unknown }) => {
  const traceId = traceIdFor(error)
  return (
    <div
      role="alert"
      className="flex items-start gap-md rounded-card border border-l-4 border-border border-l-danger bg-danger-bg p-md text-left"
    >
      <Icon data={error_outlined} className="mt-xs shrink-0 text-danger" size={24} />
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <Typography variant="h5" className="!m-0 text-strong">
          {titleFor(error)}
        </Typography>
        <Typography variant="body_short" className="!m-0 text-default">
          {messageFor(error)}
        </Typography>
        {traceId && (
          <Typography variant="caption" className="!m-0 mt-xs text-muted">
            Trace ID:{' '}
            <code className="rounded-sm bg-elevated px-xs py-[2px] font-mono text-[0.8em] text-default">
              {traceId}
            </code>
          </Typography>
        )}
      </div>
    </div>
  )
}
