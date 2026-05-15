/**
 * Standard page header — title on the left, optional meta
 */

import { Typography } from '@equinor/eds-core-react'
import { cn } from '@/shared/utils/cn'

export type PageHeaderProps = {
  title: React.ReactNode
  meta?: React.ReactNode
  className?: string
}

export const PageHeader = ({ title, meta, className }: PageHeaderProps) => (
  <header className={cn('flex flex-wrap items-baseline gap-md', className)}>
    <Typography as="h1" variant="h2">
      {title}
    </Typography>
    {meta && (
      <Typography variant="body_short" className="text-muted">
        {meta}
      </Typography>
    )}
  </header>
)
