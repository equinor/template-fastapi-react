# Theme

Tiny color-scheme toggle for `light` / `dark` / `auto`. No theme
provider, no `dark:` Tailwind variants — the CSS layer uses
`light-dark(<lightVal>, <darkVal>)` and we just toggle the active
`color-scheme` on `<html>`.

## Files

| File | Purpose |
|---|---|
| `types.ts` | `ColorScheme` type. |
| `useColorScheme.ts` | `useColorScheme()` hook + `setColorScheme()` setter (also a `useSyncExternalStore`-backed pub/sub). |
| `index.ts` | Public barrel (deep imports blocked by ESLint). |

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

| `scheme` | Effect on `<html>` style |
|---|---|
| `light` | `color-scheme: light` |
| `dark` | `color-scheme: dark` |
| `auto` | inline style removed; falls back to `:root { color-scheme: light dark }` from CSS |

The browser then resolves `light-dark(...)` based on the active
declaration.

## Persistence & FOUC

The choice is stored in `localStorage` under `color-scheme`. A small
inline script in `index.html` reads it and applies the value on the
`<html>` element **before** React mounts, so first paint matches the
saved preference.

## SSR / non-browser

`useColorScheme` returns `'auto'` as the server snapshot. If you
render outside a browser (tests, SSR), avoid calling `setColorScheme`
— it touches `window.localStorage` directly.
