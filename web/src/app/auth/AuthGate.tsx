import { Button, Progress, Typography } from '@equinor/eds-core-react'
import type { ReactNode } from 'react'
import { useAuthSession } from '@/shared/platform/auth/useAuthSession'

/**
 * Renders one of three pre-app states (error / login-in-progress / login
 * required) until the user is authenticated, then renders `children`.
 * No-op when auth is disabled — `useAuthSession` reports authenticated.
 */

const CenterContainer = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-sm justify-center items-center w-screen h-screen">{children}</div>
)

const ErrorScreen = ({ message }: { message: string }) => <CenterContainer>{message}</CenterContainer>

const LoadingScreen = () => (
  <CenterContainer>
    <Typography>Login in progress.</Typography>
    <Progress.Dots color="primary" />
  </CenterContainer>
)

const LoginScreen = ({ onLogIn }: { onLogIn: () => void }) => (
  <CenterContainer>
    <Button onClick={onLogIn}>Log in</Button>
  </CenterContainer>
)

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { error, loginInProgress, isAuthenticated, logIn } = useAuthSession()

  if (error) return <ErrorScreen message={error} />
  if (loginInProgress) return <LoadingScreen />
  if (!isAuthenticated) return <LoginScreen onLogIn={logIn} />
  return <>{children}</>
}
