import { Typography } from '@equinor/eds-core-react'
import { cn } from '@/shared/utils/cn'

export type EmptyStateProps = {
  title?: React.ReactNode
  message?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const EmptyState = ({ title, message, action, className }: EmptyStateProps) => (
  <div role="status" className={cn('flex flex-col items-center gap-sm py-xl text-center text-muted', className)}>
    {title && <Typography variant="h5">{title}</Typography>}
    {message && <Typography variant="body_short">{message}</Typography>}
    {action && <div className="mt-sm">{action}</div>}
  </div>
)
