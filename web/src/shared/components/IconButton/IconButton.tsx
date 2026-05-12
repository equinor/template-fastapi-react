import { Button, ButtonProps, Icon, Tooltip } from '@equinor/eds-core-react'
import { IconData } from '@equinor/eds-icons'

export type IconButtonProps = {
  'aria-label': string // Required on IconButtons for accessibility
  icon: IconData
  ref?: React.Ref<HTMLButtonElement>
} & ButtonProps

export function IconButton({ title, icon, ...props }: IconButtonProps) {
  const button = (
    <Button variant="ghost_icon" {...props}>
      <Icon data={icon} size={24} />
    </Button>
  )
  // EDS Tooltip on a disabled button can swallow focus/keyboard events,
  // so we drop the wrapper while disabled. The icon's own `title` keeps
  // the accessible name intact.
  if (props.disabled) return button
  return <Tooltip title={title}>{button}</Tooltip>
}
