/**
 * Tiny module-level store that latches "the session expired" so a late
 * subscriber (the React tree) still sees it.
 *
 * Why a store and not a DOM event: `createBrowserRouter()` runs the root
 * loader at module-init — *before* `<AppProviders>` mounts and the
 * dialog attaches its listener. A `dispatchEvent` from the loader would
 * fire into the void. Storing a flag means the dialog reads the latched
 * value on mount via `useSyncExternalStore` regardless of when it ran.
 *
 * Mirrors `shared/platform/toast/toastStore` deliberately so both have
 * the same shape.
 */

type Listener = () => void

let expired = false
const listeners = new Set<Listener>()

const emit = () => {
  for (const l of listeners) l()
}

export const sessionExpiredStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot(): boolean {
    return expired
  },
  /** Called by `httpClient` (and `auth.ts`) on a 401. Idempotent. */
  notify(): void {
    if (expired) return
    expired = true
    emit()
  },
  /**
   * Clear the latched flag — called after successful re-authentication
   * (e.g. by `<SessionExpiredDialog>` once the popup-tab handshake
   * confirms the session is valid again).
   */
  clear(): void {
    if (!expired) return
    expired = false
    emit()
  },
  /** Test helper — clears the latched flag. */
  _reset(): void {
    expired = false
    emit()
  },
}
