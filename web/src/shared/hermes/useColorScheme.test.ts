import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vite-plus/test'
import { initColorScheme, useColorScheme } from '@team-hermes/react-components'

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('data-color-scheme')
})

describe('Hermes color scheme', () => {
  test('initializes from storage and persists a toggled EDS scheme', async () => {
    localStorage.setItem('color-scheme', 'light')
    initColorScheme()
    const { result } = renderHook(() => useColorScheme())
    expect(result.current.colorScheme).toBe('light')
    await act(async () => result.current.toggleColorScheme())
    expect(result.current.colorScheme).toBe('dark')
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark')
    expect(localStorage.getItem('color-scheme')).toBe('dark')
  })

  test('uses the system preference when no explicit preference is stored', () => {
    initColorScheme()
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe(
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    )
  })

  // Hermes only exposes a binary toggle: https://github.com/equinor/team-hermes-packages/pull/94
  test.todo("'auto' clears the style, the attribute and the stored preference")

  test.fails('falls back to the system preference when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    expect(() => initColorScheme()).not.toThrow()
  })

  test.fails('still applies the scheme when localStorage.setItem throws', () => {
    initColorScheme()
    const { result } = renderHook(() => useColorScheme())
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })
    expect(() => act(() => result.current.toggleColorScheme())).not.toThrow()
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark')
  })
})
