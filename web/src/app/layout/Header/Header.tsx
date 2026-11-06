import { Icon } from '@equinor/eds-core-react'
import { receipt } from '@equinor/eds-icons'
import { Link } from '@tanstack/react-router'
import { NavBar } from '@team-hermes/react-components'
import { ENV } from '@/config/env'
import { useCurrentUser, useSignOut } from '@/shared/platform/auth'

export const Header = () => {
  const { data: user } = useCurrentUser()
  const signOut = useSignOut()

  return (
    <NavBar
      LinkComponent={Link}
      applicationIcon={<Icon data={receipt} />}
      applicationConfig={{
        name: 'Todo App',
        githubRepoName: ENV.repoUrl.replace(/^https:\/\/github\.com\//, '').replace(/\/$/, ''),
      }}
      categories={[]}
      user={{ name: user.name, email: '', roles: [...user.roles] }}
      logOut={signOut}
    />
  )
}
