import type { IconData } from '@equinor/eds-icons'

export interface IconButtonProps {
  title: string
  icon: IconData
  onClick: () => Promise<void> | void
  disabled?: boolean
}
