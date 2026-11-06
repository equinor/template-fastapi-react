import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { ColorSchemaToggle } from './ColorSchemaToggle'

afterEach(() => vi.restoreAllMocks())

test('restores the native radio selection and changes it with arrow keys', async () => {
  vi.spyOn(HTMLElement.prototype, 'showPopover').mockImplementation(function (this: HTMLElement) {
    this.style.display = 'block'
  })
  localStorage.setItem('color-scheme', 'dark')
  const user = userEvent.setup()
  render(<ColorSchemaToggle />)
  await user.click(screen.getByRole('button', { name: 'Color scheme' }))

  const dark = screen.getByRole('radio', { name: 'Dark' })
  const light = screen.getByRole('radio', { name: 'Light' })
  const system = screen.getByRole('radio', { name: 'System' })
  expect(dark).toBeChecked()
  expect(light).not.toBeChecked()
  expect(system).not.toBeChecked()

  dark.focus()
  await user.keyboard('{ArrowLeft}')

  expect(light).toHaveFocus()
  expect(light).toBeChecked()
  expect(dark).not.toBeChecked()
  expect(localStorage.getItem('color-scheme')).toBe('light')
})
