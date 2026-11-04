/**
 * Reactive view of the re-auth flow consumed by `<SessionExpiredDialog>`.
 *
 * Owns the popup lifecycle and the success handshake; the dialog
 * supplies the UI, and the app supplies route recovery after sign-in.
 *
 * Takes `QueryClient` explicitly so tests can pass a fresh client and
 * features don't reach into `app/bootstrap/createQueryClient` directly (matches the
 * convention used by `startSessionWatcher` and `createTodosLoader`).
 */

import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { signIn } from '../redirects'
import { userQuery } from '../userQuery'
import { POPUP_FEATURES, REAUTH_URL, subscribeAuthSuccess } from './reauthChannel'
import { sessionExpiredStore } from './sessionExpiredStore'

export interface ReauthFlow {
  /** True while the session-expired latch is set. Drives dialog visibility. */
  open: boolean
  /** True between popup open and handshake completion (or popup close). */
  signingIn: boolean
  /** True when verifying the session or resuming the page failed. */
  signInFailed: boolean
  /** Open the re-auth popup; falls back to same-tab redirect when blocked. */
  requestSignIn: () => void
}

export const useReauthFlow = (queryClient: QueryClient, onReauthenticated: () => void | Promise<void>): ReauthFlow => {
  const open = useSyncExternalStore(sessionExpiredStore.subscribe, sessionExpiredStore.getSnapshot)
  const popupRef = useRef<Window | null>(null)
  const [signingIn, setSigningIn] = useState(false)
  const [signInFailed, setSignInFailed] = useState(false)

  useEffect(() => {
    if (!open) return
    // Confirm the new session is real before dismissing — guards
    // against a popup that resolved without actually signing in.
    const finishSignIn = async () => {
      setSigningIn(true)
      setSignInFailed(false)
      try {
        await queryClient.fetchQuery({ ...userQuery(), staleTime: 0 })
        sessionExpiredStore.clear()
        await onReauthenticated()
      } catch {
        sessionExpiredStore.notify()
        setSignInFailed(true)
      } finally {
        popupRef.current?.close()
        popupRef.current = null
        setSigningIn(false)
      }
    }
    return subscribeAuthSuccess(finishSignIn)
  }, [open, queryClient, onReauthenticated])

  const requestSignIn = () => {
    setSignInFailed(false)
    setSigningIn(true)
    popupRef.current = window.open(REAUTH_URL, 'reauth', POPUP_FEATURES)
    if (popupRef.current) return
    // Popup blocked → fall back to same-tab redirect (the original
    // flow). The user loses page state but at least gets re-auth'd.
    setSigningIn(false)
    signIn()
  }

  return { open, signingIn, signInFailed, requestSignIn }
}
