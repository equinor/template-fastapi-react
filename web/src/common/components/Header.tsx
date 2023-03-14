import { Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { info_circle, log_out, receipt } from '@equinor/eds-icons'
import { useContext, useRef, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import IconButton from './IconButton'
import Popover from './Popover'
import { VersionText } from './VersionText'

const Header = () => {
  const { tokenData, logOut } = useContext(AuthContext)
  const [isPopoverOpen, setPopoverOpen] = useState(false)
  const aboutRef = useRef<HTMLButtonElement>(null)

  // unique_name might be azure-specific, different tokenData-fields might
  // be available if another OAuth-provider is used.
  const username = tokenData?.unique_name

  const togglePopover = () => setPopoverOpen(!isPopoverOpen)

  return (
    <>
      <TopBar>
        <TopBar.Header>
          <Icon data={receipt} />
          Todo App
        </TopBar.Header>
        <TopBar.Actions style={{ gap: 8 }}>
          <Typography>{`Logged in as ${username}`}</Typography>
          <IconButton title={'Log out'} icon={log_out} onClick={logOut} />
          <IconButton
            title={'Application info'}
            icon={info_circle}
            onClick={togglePopover}
            ref={aboutRef}
          />
        </TopBar.Actions>
      </TopBar>
      <Popover
        title={'About'}
        isOpen={isPopoverOpen}
        toggle={togglePopover}
        anchor={aboutRef.current}
      >
        <VersionText />
        <p>Person of contact: Eirik Ola Aksnes (eaks@equinor.com)</p>
      </Popover>
    </>
  )
}

export default Header
