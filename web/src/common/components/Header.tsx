import { useContext } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { receipt } from '@equinor/eds-icons'

Icon.add({ receipt })

const Header = () => {
  const { tokenData, token } = useContext(AuthContext)
  return (
    <TopBar>
      <TopBar.Header>
        <Icon name="receipt" />
        Todo App
      </TopBar.Header>
      <TopBar.Actions>
        <Typography variant="caption">
          Logged in as {token && tokenData?.['unique_name']}
        </Typography>
      </TopBar.Actions>
    </TopBar>
  )
}

export default Header
