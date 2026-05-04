/**
 * Subscribes to `toastStore` and renders each toast as an EDS `<Snackbar>`
 * stacked at the bottom-right. Mount once near the root in
 * `AppProviders`.
 *
 * Colours come from Tailwind tokens (defined in `app/styles/index.css`)
 * so dark mode and theme changes Just Work. Each toast has an explicit
 * "Dismiss" action — sticky errors would otherwise trap the user
 * waiting for an auto-hide that never comes.
 */

import { Button, Snackbar } from '@equinor/eds-core-react'
import { useSyncExternalStore } from 'react'
import { type Toast, toastStore } from './toastStore'

const VARIANT_CLASS: Record<Toast['variant'], string> = {
  success: 'bg-success text-on-accent',
  error: 'bg-danger text-on-accent',
  info: 'bg-info text-on-accent',
}

/**
 * EDS `<Snackbar>` treats `autoHideDuration={undefined}` as "use the
 * default" (~7s), so a sticky toast (`autoHideMs: 0`) needs an
 * explicitly huge value. One day is effectively forever for a session.
 */
const ONE_DAY_MS = 86_400_000
const autoHideFor = (ms: number) => (ms > 0 ? ms : ONE_DAY_MS)

export const ToastContainer = () => {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot)

  if (toasts.length === 0) return null

  return (
    <section
      className="fixed right-md bottom-md z-[1400] flex flex-col gap-sm pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={autoHideFor(t.autoHideMs)}
          onClose={() => toastStore.dismiss(t.id)}
          className={`!static pointer-events-auto ${VARIANT_CLASS[t.variant]}`}
          data-testid={`toast-${t.variant}`}
          // Errors interrupt the screen-reader queue; success/info wait their turn.
          role={t.variant === 'error' ? 'alert' : 'status'}
          aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
        >
          {t.message}
          <Snackbar.Action>
            <Button variant="ghost" onClick={() => toastStore.dismiss(t.id)} className="!text-on-accent">
              Dismiss
            </Button>
          </Snackbar.Action>
        </Snackbar>
      ))}
    </section>
  )
}
