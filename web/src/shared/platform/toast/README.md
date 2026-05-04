# Toast

Lightweight, framework-free toast notifications. The store is plain
JS, so it can be called from anywhere — including non-React code such
as the global `MutationCache` callbacks in `app/bootstrap/createQueryClient`.

## Files

| File | Purpose |
|---|---|
| `types.ts` | `Toast`, `ToastVariant`. |
| `toastStore.ts` | The store (pub/sub) plus `toast.success / .error / .info / .dismiss` API. |
| `ToastContainer.tsx` | Mounted once near the root; renders the queue with EDS `<Snackbar>`. |
| `index.ts` | Public barrel (deep imports blocked by ESLint). |

## Wiring

Mount the container once near the app root (already done in
`Providers.tsx`):

```tsx
<ToastContainer />
```

## Usage

```ts
import { toast } from '@/shared/platform/toast'

toast.success('Todo created')
toast.info('Saved as draft')
toast.error('Could not delete todo. trace=abcd…')

// Sticky (no auto-dismiss): autoHideMs: 0
const id = toast.info('Uploading…', { autoHideMs: 0 })
// later:
toast.dismiss(id)
```

Default auto-hide:

| Variant | ms |
|---|---|
| `success` | 4000 |
| `info` | 4000 |
| `error` | 8000 (longer so the user can read trace ids) |

## UX hygiene baked in

- **Truncation** — messages over 200 chars are truncated with `…`.
  Toasts are not log viewers.
- **Dedup** — pushing an identical `(variant, message)` while one is
  visible returns the existing id; the queue does not grow.

## Accessibility

`<Snackbar>` is rendered with:

- `role="alert"` + `aria-live="assertive"` for errors (interrupts).
- `role="status"` + `aria-live="polite"` for success/info.

Each toast has an explicit "Dismiss" button — sticky errors would
otherwise trap users waiting for an auto-hide that never comes.

## Tests

`toastStore` has unit tests covering push, dedup, truncate, dismiss,
and the `_reset()` helper. Component tests can call `toast.error(...)`
and assert via `data-testid="toast-error"`.

## Adding a variant

1. Extend `ToastVariant` in `types.ts`.
2. Add a default in `DEFAULT_AUTO_HIDE_MS` in `toastStore.ts`.
3. Add a class in `VARIANT_CLASS` in `ToastContainer.tsx`.
4. Decide aria semantics (`alert` vs `status`) for the new variant.
