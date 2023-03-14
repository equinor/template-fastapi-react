import { Button, Popover as EDSPopover } from '@equinor/eds-core-react'

interface PopoverProps {
  children: React.ReactNode
  title: string
  toggle: () => void
  isOpen: boolean
  anchor?: HTMLElement | null
}

const Popover = ({ children, title, toggle, isOpen, anchor }: PopoverProps) => {
  return (
    <EDSPopover open={isOpen} anchorEl={anchor} onClose={toggle} trapFocus>
      <EDSPopover.Header>
        <EDSPopover.Title>{title}</EDSPopover.Title>
      </EDSPopover.Header>
      <EDSPopover.Content>{children}</EDSPopover.Content>
      <EDSPopover.Actions>
        <Button onClick={toggle}>Close</Button>
      </EDSPopover.Actions>
    </EDSPopover>
  )
}

export default Popover
