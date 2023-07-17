import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import Header from './common/components/Header'
import { AuthContext } from 'react-oauth2-code-pkce'
import { useContext } from 'react'
import { Button, Progress, Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { OpenAPI } from './api/generated'

const hasAuthConfig = process.env.REACT_APP_AUTH === '1'

const CenterContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
`

function App() {
  const { token, error, login, loginInProgress } = useContext(AuthContext)

  OpenAPI.TOKEN = token

  if (hasAuthConfig && error) {
    return <CenterContainer>{error}</CenterContainer>
  }

  if (hasAuthConfig && loginInProgress) {
    return (
      <CenterContainer>
        <Typography>Login in progress.</Typography>
        <Progress.Dots color="primary" />
      </CenterContainer>
    )
  }

  if (hasAuthConfig && !token) {
    return (
      <CenterContainer>
        <Button onClick={login}>Log in</Button>
      </CenterContainer>
    )
  }

  return (
    <>
      <Header />
      <RouterProvider router={router} />
    </>
  )
}

export default App
