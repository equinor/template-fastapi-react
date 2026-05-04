import { Button, Icon, Tooltip } from '@equinor/eds-core-react'
import type { IconData } from '@equinor/eds-icons'
import { forwardRef, type Ref } from 'react'

interface IconButtonProps {
  title: string
  icon: IconData
  onClick: () => Promise<void> | void
  disabled?: boolean
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { title, icon, onClick, disabled }: IconButtonProps,
  ref: Ref<HTMLButtonElement>
) {
  const button = (
    <Button variant="ghost_icon" onClick={onClick} ref={ref} disabled={disabled}>
      <Icon data={icon} size={24} title={title} />
    </Button>
  )
  // EDS Tooltip on a disabled button can swallow focus/keyboard events,
  // so we drop the wrapper while disabled. The icon's own `title` keeps
  // the accessible name intact.
  if (disabled) return button
  return <Tooltip title={title}>{button}</Tooltip>
})

export { IconButton }
