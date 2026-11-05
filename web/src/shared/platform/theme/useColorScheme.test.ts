import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { setColorScheme, useColorScheme } from './useColorScheme'

const html = document.documentElement

afterEach(() => {
  vi.restoreAllMocks()
  html.style.removeProperty('color-scheme')
  html.removeAttribute('data-color-scheme')
})

describe('useColorScheme', () => {
  test('applies an explicit scheme as both style and data attribute, and persists it', () => {
    const { result } = renderHook(() => useColorScheme())
    expect(result.current[0]).toBe('auto')

    act(() => setColorScheme('dark'))

    expect(result.current[0]).toBe('dark')
    expect(html.style.getPropertyValue('color-scheme')).toBe('dark')
    // EDS tokens >= 2.3 select dark values via `[data-color-scheme="dark"]`.
    expect(html.getAttribute('data-color-scheme')).toBe('dark')
    expect(localStorage.getItem('color-scheme')).toBe('dark')
  })

  test("'auto' clears the style, the attribute and the stored preference", () => {
    act(() => setColorScheme('light'))
    act(() => setColorScheme('auto'))

    expect(html.style.getPropertyValue('color-scheme')).toBe('')
    expect(html.hasAttribute('data-color-scheme')).toBe(false)
    expect(localStorage.getItem('color-scheme')).toBeNull()
  })

  test("falls back to 'auto' when localStorage.getItem throws", () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    const { result } = renderHook(() => useColorScheme())
    expect(result.current[0]).toBe('auto')
  })

  test('setColorScheme still applies the scheme when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    expect(() => act(() => setColorScheme('dark'))).not.toThrow()
    expect(html.getAttribute('data-color-scheme')).toBe('dark')
  })
})
