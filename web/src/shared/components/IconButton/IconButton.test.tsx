/**
 * IconButton shows its `title` as an EDS tooltip while enabled, and as a
 * native `title` hint while disabled (the Tooltip wrapper is dropped then).
 */

import { accessible } from '@equinor/eds-icons'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, test } from 'vite-plus/test'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  test('shows the title in an EDS tooltip on hover when enabled', async () => {
    render(<IconButton icon={accessible} title="Accessibility" aria-label="Accessibility" />)
    const button = screen.getByRole('button', { name: 'Accessibility' })
    await userEvent.hover(button)
    // jsdom computes the popover as `display: none` (showPopover is stubbed
    // in setupTests), so query it as hidden and assert it describes the button.
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent('Accessibility')
    expect(button).toHaveAccessibleDescription('Accessibility')
  })

  test('does not also set a native title when enabled, to avoid a double tooltip', () => {
    render(<IconButton icon={accessible} title="Accessibility" aria-label="Accessibility" />)
    expect(screen.getByRole('button', { name: 'Accessibility' })).not.toHaveAttribute('title')
  })

  test('falls back to a native title when disabled', () => {
    render(<IconButton icon={accessible} title="Accessibility" aria-label="Accessibility" disabled />)
    expect(screen.getByRole('button', { name: 'Accessibility' })).toHaveAttribute('title', 'Accessibility')
  })

  test('forwards ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<IconButton icon={accessible} title="x" aria-label="x" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
