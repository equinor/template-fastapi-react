import type { ReactNode } from 'react'

export type EmptyStateProps = {
  title?: ReactNode
  /** Shorter helper text below the title. */
  message?: ReactNode
  /** Buttons / links that progress the user past the empty state. */
  action?: ReactNode
  className?: string
}
