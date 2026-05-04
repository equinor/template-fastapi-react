import { Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { info_circle, log_out, receipt } from '@equinor/eds-icons'
import { useRef, useState } from 'react'
import { IconButton } from '@/shared/components/IconButton/IconButton'
import { Popover } from '@/shared/components/Popover/Popover'
import { useCurrentUser, useSignOut } from '@/shared/platform/auth'
import { useColorScheme } from '@/shared/platform/theme'
import { VersionText } from '../VersionText/VersionText'
import { ICON, NEXT, TITLE } from './Header.utils'

export const Header = () => {
  const { data: user } = useCurrentUser()
  const username = user.name
  const [scheme, setScheme] = useColorScheme()
  const [isPopoverOpen, setPopoverOpen] = useState(false)
  const aboutRef = useRef<HTMLButtonElement>(null)
  const signOut = useSignOut()

  const togglePopover = () => setPopoverOpen((open) => !open)

  return (
    <>
      <TopBar>
        <TopBar.Header>
          <Icon data={receipt} />
          Todo App
        </TopBar.Header>
        <TopBar.Actions style={{ gap: 8 }}>
          <IconButton title={TITLE[scheme]} icon={ICON[scheme]} onClick={() => setScheme(NEXT[scheme])} />
          <IconButton title={'Log out'} icon={log_out} onClick={signOut} />
          <IconButton title={'Application info'} icon={info_circle} onClick={togglePopover} ref={aboutRef} />
        </TopBar.Actions>
      </TopBar>
      <Popover title={'About'} isOpen={isPopoverOpen} toggle={togglePopover} anchor={aboutRef.current}>
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
