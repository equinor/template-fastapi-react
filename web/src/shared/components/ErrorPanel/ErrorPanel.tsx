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
      className="flex items-start gap-md rounded border border-l-4 border-border border-l-danger bg-danger-bg p-md text-left"
    >
      <Icon data={error_outlined} className="mt-xs shrink-0" size={24} />
      <div className="flex min-w-0 flex-1 flex-col">
        <h5 className="font-bold text-lg">{titleFor(error)}</h5>
        <p>{messageFor(error)}</p>
        {traceId && (
          <Typography variant="caption" className="mt-s">
            Trace ID: <code className="py-0.5 font-mono">{traceId}</code>
          </Typography>
        )}
      </div>
    </div>
  )
}
