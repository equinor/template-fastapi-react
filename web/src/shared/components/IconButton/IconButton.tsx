import { Button, type ButtonProps, Icon, Tooltip } from '@equinor/eds-core-react'
import type { IconData } from '@equinor/eds-icons'

export type IconButtonProps = {
  'aria-label': string // Required on IconButtons for accessibility
  icon: IconData
  ref?: React.Ref<HTMLButtonElement>
} & ButtonProps

export function IconButton({ title, icon, ...props }: IconButtonProps) {
  const button = (
    <Button variant="ghost_icon" title={props.disabled ? title : undefined} {...props}>
      <Icon data={icon} size={24} />
    </Button>
  )
  // EDS Tooltip on a disabled button can swallow focus/keyboard events,
  // so we drop the wrapper while disabled and fall back to a native
  // `title` hint. It's not set while enabled: Tooltip doesn't strip it,
  // so the browser would show its own tooltip on top of the EDS one.
  // The accessible name comes from `aria-label` either way.
  if (props.disabled) return button
  return <Tooltip title={title}>{button}</Tooltip>
}
