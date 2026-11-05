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

import { hashKey, type QueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { signIn } from '../redirects'
import { getCurrentUser, USER_QUERY_KEY, userQuery } from '../userQuery'
import { POPUP_FEATURES, REAUTH_URL, subscribeAuthSuccess } from './reauthChannel'
import { sessionExpiredStore } from './sessionExpiredStore'

const POPUP_CLOSED_POLL_MS = 500
// The popup posts the handshake and then closes itself, so give the
// message time to arrive before treating the close as an abandoned sign-in.
const POPUP_CLOSED_GRACE_MS = 1000

// Another account signed in: drop everything cached for the previous one.
// `resetQueries` (not `removeQueries`) so mounted observers refetch too.
const resetPreviousUserData = (queryClient: QueryClient) => {
  const userQueryHash = hashKey(USER_QUERY_KEY)
  return queryClient.resetQueries({ predicate: (query) => query.queryHash !== userQueryHash })
}

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
  const stopPopupWatchRef = useRef<(() => void) | null>(null)
  const [signingIn, setSigningIn] = useState(false)
  const [signInFailed, setSignInFailed] = useState(false)

  useEffect(() => () => stopPopupWatchRef.current?.(), [])

  useEffect(() => {
    if (!open) return
    // Confirm the new session is real before dismissing — guards
    // against a popup that resolved without actually signing in.
    const finishSignIn = async () => {
      stopPopupWatchRef.current?.()
      setSigningIn(true)
      setSignInFailed(false)
      try {
        const previousUser = getCurrentUser(queryClient)
        const user = await queryClient.fetchQuery({ ...userQuery(), staleTime: 0 })
        if (previousUser && previousUser.id !== user.id) {
          await resetPreviousUserData(queryClient)
        }
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

  // Re-enable "Sign in" when the user closes the popup without finishing.
  // If COOP severs the opener, `closed` can read true early; that only
  // re-enables the button — the handshake above still completes sign-in.
  const watchPopup = (popup: Window) => {
    let graceTimer: ReturnType<typeof setTimeout> | undefined
    const pollTimer = setInterval(() => {
      if (!popup.closed || graceTimer) return
      graceTimer = setTimeout(() => {
        stopPopupWatchRef.current?.()
        if (popupRef.current === popup) popupRef.current = null
        setSigningIn(false)
      }, POPUP_CLOSED_GRACE_MS)
    }, POPUP_CLOSED_POLL_MS)
    stopPopupWatchRef.current = () => {
      clearInterval(pollTimer)
      clearTimeout(graceTimer)
      stopPopupWatchRef.current = null
    }
  }

  const requestSignIn = () => {
    stopPopupWatchRef.current?.()
    setSignInFailed(false)
    setSigningIn(true)
    popupRef.current = window.open(REAUTH_URL, 'reauth', POPUP_FEATURES)
    if (popupRef.current) {
      watchPopup(popupRef.current)
      return
    }
    // Popup blocked → fall back to same-tab redirect (the original
    // flow). The user loses page state but at least gets re-auth'd.
    setSigningIn(false)
    signIn()
  }

  return { open, signingIn, signInFailed, requestSignIn }
}
