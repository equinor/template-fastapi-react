/**
 * SessionExpiredDialog reacts to the `session-expired` window event that
 * `httpClient` dispatches on 401. Test by dispatching the event manually.
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/app/AppProviders'
import { SESSION_EXPIRED_EVENT } from '@/shared/api/events'

describe('SessionExpiredDialog', () => {
  test('opens when the session-expired event fires', async () => {
    render(<AppProviders>{null}</AppProviders>)

    expect(screen.queryByText('Session expired')).toBeNull()

    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))

    await waitFor(() => {
      expect(screen.getByText('Session expired')).toBeDefined()
    })
  })
})
