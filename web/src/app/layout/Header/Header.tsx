import { Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { info_circle, log_out, receipt } from '@equinor/eds-icons'
import { createLink } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { IconButton } from '@/shared/components/IconButton/IconButton'
import { Popover } from '@/shared/components/Popover/Popover'
import { useCurrentUser, useSignOut } from '@/shared/platform/auth'
import { VersionText } from '../VersionText/VersionText'
import { ColorSchemaToggle } from './components/ColorSchemaToggle/ColorSchemaToggle'

const HomeLink = createLink(TopBar.Header)

export const Header = () => {
  const { data: user } = useCurrentUser()
  const username = user.name

  const [isAboutOpen, setAboutOpen] = useState(false)

  const aboutRef = useRef<HTMLButtonElement>(null)
  const signOut = useSignOut()

  return (
    <>
      <TopBar>
        <HomeLink to="/" className="cursor-pointer hover:underline">
          <Icon data={receipt} />
          Todo App
        </HomeLink>
        <TopBar.Actions style={{ gap: 8 }}>
          <ColorSchemaToggle />
          <IconButton aria-label="Log out" title={'Log out'} icon={log_out} onClick={signOut} />
          <IconButton
            aria-label="Application info"
            title={'Application info'}
            icon={info_circle}
            onClick={() => setAboutOpen(!isAboutOpen)}
            ref={aboutRef}
          />
        </TopBar.Actions>
      </TopBar>

      <Popover title={'About'} isOpen={isAboutOpen} toggle={() => setAboutOpen(false)} anchor={aboutRef.current}>
        {username && (
          <Typography variant="caption" className="text-muted">
            {`Logged in as ${username}`}
          </Typography>
        )}
        <VersionText />
        <p>Person of contact: Eirik Ola Aksnes (eaks@equinor.com)</p>
      </Popover>
    </>
  )
}
