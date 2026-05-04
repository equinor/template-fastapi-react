/**
 * Tiny pub/sub store for toast notifications. Framework-free so it can be
 * called from anywhere — including non-React code like the global
 * `MutationCache` callbacks in `shared/api/queryClient`.
 *
 * The store holds the *queue* of currently-visible toasts; the
 * `<ToastContainer />` subscribes via `useSyncExternalStore` and renders
 * them with EDS `<Snackbar>`. Toasts auto-dismiss after `autoHideMs`.
 *
 * Two pieces of UX hygiene live here so every caller benefits:
 *   - Long messages are truncated — toasts are not log viewers.
 *   - Identical messages are deduped — clicking "delete" twice on a
 *     flaky network shouldn't spam the user with the same toast twice.
 *     Instead the existing toast keeps its place in the queue.
 */

export type ToastVariant = 'success' | 'error' | 'info'

export type Toast = {
  id: number
  variant: ToastVariant
  message: string
  /** Auto-dismiss after N ms. `0` means sticky (caller must dismiss). */
  autoHideMs: number
}

type Listener = (toasts: readonly Toast[]) => void

/** Toasts are notifications, not log viewers. Anything longer is truncated. */
const MAX_MESSAGE_LENGTH = 200

const truncate = (message: string): string =>
  message.length > MAX_MESSAGE_LENGTH ? `${message.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : message

let nextId = 1
let toasts: readonly Toast[] = []
const listeners = new Set<Listener>()

const emit = () => {
  for (const l of listeners) l(toasts)
}

export const toastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot(): readonly Toast[] {
    return toasts
  },
  push(input: Omit<Toast, 'id'>): number {
    const message = truncate(input.message)
    const existing = toasts.find((t) => t.variant === input.variant && t.message === message)
    if (existing) return existing.id
    const toast: Toast = { id: nextId++, ...input, message }
    toasts = [...toasts, toast]
    emit()
    return toast.id
  },
  dismiss(id: number): void {
    const next = toasts.filter((t) => t.id !== id)
    if (next.length === toasts.length) return
    toasts = next
    emit()
  },
  /** Test helper — wipes the queue and resets ids. */
  _reset(): void {
    toasts = []
    nextId = 1
    emit()
  },
}

const DEFAULT_AUTO_HIDE_MS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  // Errors stay longer so the user can read the trace id.
  error: 8000,
}

const make =
  (variant: ToastVariant) =>
  (message: string, opts?: { autoHideMs?: number }): number =>
    toastStore.push({
      variant,
      message,
      autoHideMs: opts?.autoHideMs ?? DEFAULT_AUTO_HIDE_MS[variant],
    })

export const toast = {
  success: make('success'),
  error: make('error'),
  info: make('info'),
  dismiss: (id: number) => toastStore.dismiss(id),
}
