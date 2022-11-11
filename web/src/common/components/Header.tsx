import { useContext } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { Button, Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { log_out, receipt } from '@equinor/eds-icons'

const Header = () => {
  const { tokenData, logOut } = useContext(AuthContext)

  // unique_name might be azure-specific, different tokenData-fields might
  // be available if another OAuth-provider is used.
  const username = tokenData?.unique_name
  return (
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
      </TopBar.Actions>
    </TopBar>
  )
}

export default Header
