// Color-scheme toggle. We toggle by writing both the `color-scheme`
// style and the `data-color-scheme` attribute on `<html>`:
//   light → color-scheme: light, data-color-scheme="light"
//   dark  → color-scheme: dark,  data-color-scheme="dark"
//   auto  → remove both; falls back to :root { color-scheme: light dark }
//           and the OS preference
//
// The style drives `light-dark()` and browser-native widgets. The
// attribute is what EDS tokens key off: from @equinor/eds-tokens 2.3,
// dark values live under `[data-color-scheme="dark"]` instead of in
// `light-dark()`, so the style alone would leave EDS colours unchanged.
//
// No theme provider, no `dark:` Tailwind variants. Every component
// using `bg-canvas`, `text-strong` etc. follows automatically.
//
// Persistence: localStorage under STORAGE_KEY. A tiny pre-hydration
// script in index.html applies the saved value before React mounts to
// avoid a light/dark flash on first paint.

import { useSyncExternalStore } from 'react'
import type { ColorScheme } from './types'

const STORAGE_KEY = 'color-scheme'

const read = (): ColorScheme => {
  if (typeof window === 'undefined') return 'auto'
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    // Storage can throw (blocked cookies/site data, sandboxed iframes).
    // Fall back to the same default as an unset key.
    return 'auto'
  }
}

const apply = (scheme: ColorScheme) => {
  const el = document.documentElement
  if (scheme === 'auto') {
    el.style.removeProperty('color-scheme')
    el.removeAttribute('data-color-scheme')
  } else {
    el.style.setProperty('color-scheme', scheme)
    el.setAttribute('data-color-scheme', scheme)
  }
}

const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const setColorScheme = (scheme: ColorScheme) => {
  try {
    if (scheme === 'auto') {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, scheme)
    }
  } catch {
    // Persistence is best-effort; still apply the scheme for this session.
  }
  apply(scheme)
  for (const cb of listeners) cb()
}

export const useColorScheme = () => {
  const scheme = useSyncExternalStore(
    subscribe,
    () => read(),
    () => 'auto' as ColorScheme
  )
  return [scheme, setColorScheme] as const
}
