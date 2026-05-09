/**
 * Modal dialog shown when `httpClient` latches `sessionExpiredStore`
 * on a 401. Pure presentation: state and the popup handshake live in
 * `useReauthFlow` (under `platform/auth`).
 *
 * Built on the native `<dialog>` element via `showModal()`, which gives
 * us focus trap, top-layer rendering, and focus restoration for free.
 * Esc is intercepted (`cancel` event) to keep the dialog modal-required
 * — dismissing only delays the next 401, which immediately re-opens
 * the dialog. The only escape is "Sign in".
 */

import { Button, Card, Typography } from '@equinor/eds-core-react'
import { useQueryClient } from '@tanstack/react-query'
import { type SyntheticEvent, useEffect, useRef } from 'react'
import { useReauthFlow } from '@/shared/platform/auth'

const TITLE_ID = 'session-expired-title'
const DESC_ID = 'session-expired-description'

export const SessionExpiredDialog = () => {
  const queryClient = useQueryClient()
  const { open, signingIn, requestSignIn } = useReauthFlow(queryClient)
  return open ? <Dialog signingIn={signingIn} onSignIn={requestSignIn} /> : null
}

interface DialogProps {
  signingIn: boolean
  onSignIn: () => void
}

const Dialog = ({ signingIn, onSignIn }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  // Block Esc-to-dismiss; see file header.
  const blockCancel = (e: SyntheticEvent<HTMLDialogElement>) => e.preventDefault()

  return (
    <dialog
      ref={ref}
      aria-labelledby={TITLE_ID}
      aria-describedby={DESC_ID}
      onCancel={blockCancel}
      style={{
        border: 'none',
        padding: 0,
        background: 'transparent',
        maxWidth: '24rem',
        margin: 'auto',
      }}
    >
      <Card style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
        <Typography id={TITLE_ID} variant="h5">
          Session expired
        </Typography>
        <Typography id={DESC_ID} variant="body_short">
          {signingIn
            ? 'Complete sign-in in the popup window. This dialog will close automatically when you’re done.'
            : 'Your session has expired. Sign in again in a popup — this page and your work will stay as they are.'}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onSignIn} disabled={signingIn}>
            {signingIn ? 'Waiting for sign-in…' : 'Sign in'}
          </Button>
        </div>
      </Card>
    </dialog>
  )
}
