import { useContext } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { Icon, TopBar, Typography } from '@equinor/eds-core-react'
import { receipt } from '@equinor/eds-icons'

Icon.add({ receipt })

const Header = () => {
  const { tokenData } = useContext(AuthContext)
  return (
    <TopBar>
      <TopBar.Header>
        <Icon name="receipt" />
        Todo App
      </TopBar.Header>
      <TopBar.Actions>
        <Typography variant="caption">
          {tokenData
            ? `Logged in as ${tokenData?.['unique_name']}`
            : 'Unauthenticated'}
        </Typography>
      </TopBar.Actions>
    </TopBar>
  )
}

export default Header
