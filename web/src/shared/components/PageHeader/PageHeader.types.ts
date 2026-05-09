import type { ReactNode } from 'react'

export type PageHeaderProps = {
  title: ReactNode
  /** Subtitle / count / status indicator rendered next to the title. */
  meta?: ReactNode
  /** Right-aligned action slot (buttons, links). */
  actions?: ReactNode
  className?: string
}
