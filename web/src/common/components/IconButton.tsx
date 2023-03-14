import { Button, Icon, Tooltip } from '@equinor/eds-core-react'
import { IconData } from '@equinor/eds-icons'
import { forwardRef, Ref } from 'react'

interface IconButtonProps {
  title: string
  icon: IconData
  onClick: () => Promise<void> | void
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { title, icon, onClick }: IconButtonProps,
    ref: Ref<HTMLButtonElement>
  ) {
    return (
      <Tooltip title={title}>
        <Button variant="ghost_icon" onClick={onClick} ref={ref}>
          <Icon data={icon} size={24} title={title} />
        </Button>
      </Tooltip>
    )
  }
)

export default IconButton
