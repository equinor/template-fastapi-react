import { Button, Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { info_circle, log_out, receipt } from '@equinor/eds-icons'
import { useContext, useRef, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import Popover from './Popover'
import { VersionText } from './VersionText'

const Header = () => {
  const { tokenData, logOut } = useContext(AuthContext)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const aboutRef = useRef<HTMLButtonElement>(null)

  // unique_name might be azure-specific, different tokenData-fields might
  // be available if another OAuth-provider is used.
  const username = tokenData?.unique_name

  const togglePopover = () => setIsAboutOpen(!isAboutOpen)

  return (
    <>
      <TopBar>
        <TopBar.Header>
          <Icon data={receipt} />
          Todo App
        </TopBar.Header>
        <TopBar.Actions style={{ gap: 8 }}>
          {tokenData ? (
            <>
              <Typography>Logged in as {username}</Typography>
              <Button
                variant="ghost_icon"
                aria-label="Log out"
                title="Log out"
                onClick={logOut}
              >
                <Icon data={log_out} title="Log out" />
              </Button>
            </>
          ) : (
            <Typography variant="caption">Unauthenticated</Typography>
          )}
          <Button
            variant="ghost_icon"
            aria-label="Application info"
            title="Application info"
            onClick={togglePopover}
            ref={aboutRef}
          >
            <Icon data={info_circle} />
          </Button>
        </TopBar.Actions>
      </TopBar>
      <Popover
        title={'About'}
        isOpen={isAboutOpen}
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
