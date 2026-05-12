/**
 * Standard page header — title on the left, optional meta + actions on
 * the right. Keeps spacing/typography consistent across feature pages.
 */

import { Typography } from '@equinor/eds-core-react'
import { cn } from '@/shared/utils/cn'
import type { PageHeaderProps } from './PageHeader.types'

export const PageHeader = ({ title, meta, actions, className }: PageHeaderProps) => (
  <header className={cn('flex flex-wrap items-baseline justify-between gap-md', className)}>
    <div className="flex items-baseline gap-md">
      <Typography as="h1" variant="h2">
        {title}
      </Typography>
      {meta && (
        <Typography variant="body_short" className="text-muted">
          {meta}
        </Typography>
      )}
    </div>
    {actions && <div className="flex items-center gap-sm">{actions}</div>}
  </header>
)
