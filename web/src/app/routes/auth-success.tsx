/**
 * `/auth-success` — landing target inside the re-auth popup tab.
 * No loader — this route MUST mount even when the parent window's
 * session is technically still expired at the moment the popup opens.
 * The handshake hook posts a message back to the opener and closes
 * this tab.
 */

import { createFileRoute } from '@tanstack/react-router'
import { LoadingState } from '@/shared/components/LoadingState/LoadingState'
import { useAuthSuccessHandshake } from '@/shared/platform/auth'

const AuthSuccessPage = () => {
  useAuthSuccessHandshake()
  return <LoadingState variant="fullscreen" label="Signed in. You can close this tab." />
}

export const Route = createFileRoute('/auth-success')({
  component: AuthSuccessPage,
})
