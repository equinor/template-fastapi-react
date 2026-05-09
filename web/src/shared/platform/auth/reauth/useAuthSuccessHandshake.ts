/**
 * One-shot effect for the popup-side `/auth-success` page: broadcast
 * the success signal to the opener tab, then close. The page component
 * owns presentation; this hook owns the wire protocol.
 */

import { useEffect } from 'react'
import { broadcastAuthSuccess } from './reauthChannel'

export const useAuthSuccessHandshake = (): void => {
  useEffect(() => {
    broadcastAuthSuccess()
    // Some browsers refuse `window.close()` for tabs not opened via
    // script (or when the opener was severed); the page's visible
    // message is the fallback for that case.
    window.close()
  }, [])
}
