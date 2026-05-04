/**
 * Sibling dialog (not a wrapper) listening for the `session-expired` window
 * event that `httpClient` dispatches on 401. Re-triggers PKCE login so the
 * user keeps their place after re-authenticating (auth's `preLogin` saves
 * the current path).
 *
 * Intentionally modal-required: no `onClose`, no Esc/backdrop dismiss.
 * Letting the user dismiss only delays the next 401, which immediately
 * re-opens the dialog — a frustrating loop. The only escape is "Sign in".
 */

import { Button, Dialog, Typography } from '@equinor/eds-core-react'
import { useEffect, useState } from 'react'
import { SESSION_EXPIRED_EVENT } from '@/shared/api/events'
import { useAuthSession } from '@/shared/platform/auth/useAuthSession'

export const SessionExpiredDialog = () => {
  const { logIn } = useAuthSession()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onExpired = () => setOpen(true)
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
    }
  }, [])

  if (!open) return null

  return (
    <Dialog open={open}>
      <Dialog.Header>
        <Dialog.Title>Session expired</Dialog.Title>
      </Dialog.Header>
      <Dialog.CustomContent>
        <Typography variant="body_short">
          Your session has expired. Please sign in again to continue — your current page will be restored after login.
        </Typography>
      </Dialog.CustomContent>
      <Dialog.Actions>
        <Button
          onClick={() => {
            setOpen(false)
            logIn()
          }}
        >
          Sign in
        </Button>
      </Dialog.Actions>
    </Dialog>
  )
}
