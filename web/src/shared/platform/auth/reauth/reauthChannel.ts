/**
 * Re-auth handshake protocol shared by the popup tab (`/auth-success`)
 * and the parent tab (`SessionExpiredDialog`).
 *
 * Wire format is intentionally tiny — a single string on a same-origin
 * BroadcastChannel, with a `window.message` fallback for browsers that
 * lack BroadcastChannel.
 */

export const AUTH_SUCCESS_MESSAGE = 'auth-success'
export const AUTH_CHANNEL_NAME = 'auth-handshake'

export const POPUP_FEATURES = 'popup=yes,width=520,height=640'
export const REAUTH_URL = `/oauth2/sign_in?rd=${encodeURIComponent('/auth-success')}`

/**
 * Popup-side: tell the opener tab the OIDC dance succeeded. Tries
 * BroadcastChannel first (works even when `window.opener` was severed
 * by COOP), falls back to `postMessage` if available.
 */
export const broadcastAuthSuccess = (): void => {
  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME)
    channel.postMessage(AUTH_SUCCESS_MESSAGE)
    channel.close()
  } catch {
    if (window.opener) {
      window.opener.postMessage(AUTH_SUCCESS_MESSAGE, window.location.origin)
    }
  }
}

/**
 * Parent-side: subscribe to the success signal. Returns an unsubscribe
 * function. Wires up both transports; `handler` runs at most once per
 * received message but can fire multiple times across reconnects.
 */
export const subscribeAuthSuccess = (handler: () => void): (() => void) => {
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(AUTH_CHANNEL_NAME) : null
  if (channel) {
    channel.onmessage = (e) => {
      if (e.data === AUTH_SUCCESS_MESSAGE) handler()
    }
  }

  const onMessage = (e: MessageEvent) => {
    // Origin gate: `window.message` is cross-origin by default, so we
    // must reject foreign senders. BroadcastChannel is same-origin by
    // browser policy and needs no extra check.
    if (e.origin !== window.location.origin) return
    if (e.data !== AUTH_SUCCESS_MESSAGE) return
    handler()
  }
  window.addEventListener('message', onMessage)

  return () => {
    window.removeEventListener('message', onMessage)
    channel?.close()
  }
}
