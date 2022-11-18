import { useContext, useRef, useState } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import {
  Button,
  Icon,
  TopBar,
  Typography,
  Popover,
} from '@equinor/eds-core-react'
import { log_out, receipt, info_circle } from '@equinor/eds-icons'
import { VersionText } from './VersionText'

const Header = () => {
  const { tokenData, logOut } = useContext(AuthContext)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const aboutRef = useRef<HTMLButtonElement>(null)

  // unique_name might be azure-specific, different tokenData-fields might
  // be available if another OAuth-provider is used.
  const username = tokenData?.unique_name
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
            onClick={() => setIsAboutOpen(!isAboutOpen)}
            ref={aboutRef}
          >
            <Icon data={info_circle} />
          </Button>
        </TopBar.Actions>
      </TopBar>
      <Popover
        open={isAboutOpen}
        anchorEl={aboutRef.current}
        onClose={() => setIsAboutOpen(false)}
        trapFocus
      >
        <Popover.Header>
          <Popover.Title>About</Popover.Title>
        </Popover.Header>
        <Popover.Content>
          <VersionText />
          <p>Person of contact: Eirik Ola Aksnes (eaks@equinor.com)</p>
        </Popover.Content>
        <Popover.Actions>
          <Button onClick={() => setIsAboutOpen(false)}>Close</Button>
        </Popover.Actions>
      </Popover>
    </>
  )
}

export default Header
