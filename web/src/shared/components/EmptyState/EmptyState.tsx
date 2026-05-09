/**
 * Standard empty-state surface for list/grid/page contexts.
 *
 * Three optional pieces — title, body, and an action slot — so the
 * caller picks how loud the message is. The wrapper supplies neutral
 * spacing and centers content; the role lets assistive tech announce
 * the empty result instead of silently rendering nothing.
 */

import { Typography } from '@equinor/eds-core-react'
import { cn } from '@/shared/utils/cn'
import type { EmptyStateProps } from './EmptyState.types'

export const EmptyState = ({ title, message, action, className }: EmptyStateProps) => (
  <div role="status" className={cn('flex flex-col items-center gap-sm py-xl text-center text-muted', className)}>
    {title && (
      <Typography variant="h5" className="!m-0 text-default">
        {title}
      </Typography>
    )}
    {message && (
      <Typography variant="body_short" className="!m-0">
        {message}
      </Typography>
    )}
    {action && <div className="mt-sm">{action}</div>}
  </div>
)
