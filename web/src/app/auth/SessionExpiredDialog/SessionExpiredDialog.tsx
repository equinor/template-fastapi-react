/**
 * Non-dismissable Modal dialog shown when `httpClient` latches `sessionExpiredStore`
 * on a 401. Pure presentation: state and the popup handshake live in
 * `useReauthFlow` (under `platform/auth`).
 */

import { Button, Dialog as EDSDialog, Typography } from '@equinor/eds-core-react'
import { useQueryClient } from '@tanstack/react-query'
import { useReauthFlow } from '@/shared/platform/auth'

const TITLE_ID = 'session-expired-title'
const DESC_ID = 'session-expired-description'

export const SessionExpiredDialog = () => {
  const queryClient = useQueryClient()
  const { open, signingIn, requestSignIn } = useReauthFlow(queryClient)
  return open ? (
    <EDSDialog
      aria-labelledby={TITLE_ID}
      aria-describedby={DESC_ID}
      isDismissable={false}
      open
      style={{ width: '100vw', maxWidth: 420 }}
    >
      <EDSDialog.Header>
        <EDSDialog.Title id={TITLE_ID}>Session expired</EDSDialog.Title>
      </EDSDialog.Header>
      <EDSDialog.Content>
        <Typography id={DESC_ID} variant="body_short">
          {signingIn
            ? 'Complete sign-in in the popup window. This dialog will close automatically when you’re done.'
            : 'Your session has expired. Sign in again in a popup — this page and your work will stay as they are.'}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button onClick={requestSignIn} disabled={signingIn}>
            {signingIn ? 'Waiting for sign-in…' : 'Sign in'}
          </Button>
        </div>
      </EDSDialog.Content>
    </EDSDialog>
  ) : null
}
