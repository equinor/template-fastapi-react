import { useSyncExternalStore } from 'react'

/**
 * Color-scheme preference: 'light' | 'dark' | 'auto' (follow OS).
 *
 * How it works
 * ------------
 * The CSS layer uses `light-dark(<lightVal>, <darkVal>)`, which the browser
 * resolves based on the nearest `color-scheme` declaration. We therefore
 * toggle by writing `color-scheme` directly on `<html>`:
 *
 *   light  →  color-scheme: light
 *   dark   →  color-scheme: dark
 *   auto   →  remove inline style; falls back to :root { color-scheme: light dark }
 *
 * No theme provider, no `dark:` Tailwind variants. Every component using
 * `bg-canvas`, `text-strong` etc. follows automatically.
 *
 * Persistence: localStorage under STORAGE_KEY. A tiny pre-hydration script
 * in index.html applies the saved value before React mounts to avoid a
 * light/dark flash on first paint.
 */

export type ColorScheme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'color-scheme'

const read = (): ColorScheme => {
  if (typeof window === 'undefined') return 'auto'
  const v = window.localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' ? v : 'auto'
}

const apply = (scheme: ColorScheme) => {
  const el = document.documentElement
  if (scheme === 'auto') {
    el.style.removeProperty('color-scheme')
  } else {
    el.style.setProperty('color-scheme', scheme)
  }
}

const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const setColorScheme = (scheme: ColorScheme) => {
  if (scheme === 'auto') {
    window.localStorage.removeItem(STORAGE_KEY)
  } else {
    window.localStorage.setItem(STORAGE_KEY, scheme)
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
