import { Button, Icon, Tooltip } from '@equinor/eds-core-react'
import { IconData } from '@equinor/eds-icons'

interface IconButtonProps {
  title: string
  icon: IconData
  onClick: () => Promise<void>
}

const IconButton = ({ title, icon, onClick }: IconButtonProps) => {
  return (
    <Tooltip title={title}>
      <Button variant="ghost_icon" onClick={onClick}>
        <Icon data={icon} size={24} title={title} />
      </Button>
    </Tooltip>
  )
}

export default IconButton
