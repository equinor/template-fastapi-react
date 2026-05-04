import { Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { info_circle, light, lightbulb, log_out, receipt, sun } from '@equinor/eds-icons'
import { useRef, useState } from 'react'
import { IconButton } from '@/shared/components/IconButton'
import { Popover } from '@/shared/components/Popover'
import { useAuthSession } from '@/shared/platform/auth/useAuthSession'
import { type ColorScheme, useColorScheme } from '@/shared/platform/theme/useColorScheme'
import { VersionText } from './VersionText'

// Cycle: auto → light → dark → auto. Tooltip shows the *next* state so
// the click outcome is predictable.
const NEXT: Record<ColorScheme, ColorScheme> = { auto: 'light', light: 'dark', dark: 'auto' }
const ICON: Record<ColorScheme, typeof sun> = { auto: light, light: sun, dark: lightbulb }
const TITLE: Record<ColorScheme, string> = {
  auto: 'Theme: follow system — switch to light',
  light: 'Theme: light — switch to dark',
  dark: 'Theme: dark — follow system',
}

export const Header = () => {
  const { username, logOut } = useAuthSession()
  const [scheme, setScheme] = useColorScheme()
  const [isPopoverOpen, setPopoverOpen] = useState(false)
  const aboutRef = useRef<HTMLButtonElement>(null)

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
          <IconButton title={'Log out'} icon={log_out} onClick={logOut} />
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
