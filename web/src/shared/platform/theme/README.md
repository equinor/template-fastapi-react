# Theme

Tiny color-scheme toggle for `light` / `dark` / `auto`. No theme
provider, no `dark:` Tailwind variants — the CSS layer uses EDS tokens
(and `light-dark(<lightVal>, <darkVal>)`), and we just toggle the active
`color-scheme` and `data-color-scheme` on `<html>`.

## Files

| File                | Purpose                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `types.ts`          | `ColorScheme` type.                                                                                 |
| `useColorScheme.ts` | `useColorScheme()` hook + `setColorScheme()` setter (also a `useSyncExternalStore`-backed pub/sub). |
| `index.ts`          | Public barrel (deep imports blocked by ESLint).                                                     |

## Usage

```tsx
const [scheme, setScheme] = useColorScheme()

return (
  <select value={scheme} onChange={(e) => setScheme(e.target.value as ColorScheme)}>
    <option value="auto">Auto</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
)
```

Components using design tokens (`bg-canvas`, `text-strong`, …) follow
automatically; no per-component `dark:` styles needed.

## How it works

| `scheme` | Effect on `<html>`                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| `light`  | `color-scheme: light` + `data-color-scheme="light"`                                                                   |
| `dark`   | `color-scheme: dark` + `data-color-scheme="dark"`                                                                     |
| `auto`   | inline style and attribute removed; falls back to `:root { color-scheme: light dark }` from CSS and the OS preference |

The browser then resolves `light-dark(...)` and native widgets based on
the active `color-scheme`. EDS tokens (from `@equinor/eds-tokens` 2.3)
pick their light/dark values from the `data-color-scheme` attribute, so
both must be set.

## Persistence & FOUC

The choice is stored in `localStorage` under `color-scheme`. A small
inline script in `index.html` reads it and applies the value on the
`<html>` element **before** React mounts, so first paint matches the
saved preference.

## SSR / non-browser

`useColorScheme` returns `'auto'` as the server snapshot. If you
render outside a browser (SSR), avoid calling `setColorScheme` — it
touches `window` and `document` directly. Storage failures (blocked
site data, sandboxed iframes, quota errors) are ignored: the scheme
still applies for the session, it just isn't persisted.
