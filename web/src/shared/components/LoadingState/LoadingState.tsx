/**
 * Standard loading surface. Use for in-page suspense fallbacks and
 * route-level hydrate fallbacks.
 */

import { Progress, Typography } from '@equinor/eds-core-react'
import { cn } from '@/shared/utils/cn'
import type { LoadingStateProps } from './LoadingState.types'

export const LoadingState = ({ label = 'Loading…', variant = 'inline', className }: LoadingStateProps) => (
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className={cn(
      'flex flex-col items-center justify-center gap-sm',
      variant === 'fullscreen' ? 'w-screen h-screen' : 'py-xl',
      className
    )}
  >
    <Typography variant="body_short">{label}</Typography>
    <Progress.Dots color="primary" />
  </div>
)
