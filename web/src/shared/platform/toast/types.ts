// Public types for the toast platform module.

export type ToastVariant = 'success' | 'error' | 'info'

export type Toast = {
  id: number
  variant: ToastVariant
  message: string
  // Auto-dismiss after N ms. `0` means sticky (caller must dismiss).
  autoHideMs: number
}
