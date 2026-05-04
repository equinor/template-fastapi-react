/**
 * Covers the toggle and delete flows end-to-end through the optimistic
 * mutations + MSW. Asserts the UI updates immediately and the row is
 * gone after delete.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { Suspense } from 'react'
import { beforeEach, describe, expect, test } from 'vitest'
import { AppProviders } from '../../../../app/AppProviders'
import { db } from '../../../../mocks/db'
import { setCurrentUserForTests } from '../../../../shared/platform/auth/auth'
import { TodosPage } from './TodosPage'

const renderPage = () =>
  render(
    <AppProviders>
      <NuqsTestingAdapter>
        <Suspense fallback={<div>Loading…</div>}>
          <TodosPage />
        </Suspense>
      </NuqsTestingAdapter>
    </AppProviders>
  )

describe('TodosPage — mutations', () => {
  beforeEach(() => {
    // Bypass the router loader: hydrate the user directly so
    // permission-gated controls render.
    setCurrentUserForTests({
      id: 'anonymous',
      name: 'Local developer',
      roles: ['admin'],
    })
  })
  test('toggles a todo', async () => {
    const user = userEvent.setup()
    db.todos = [{ id: '1', title: 'Buy milk', is_completed: false }]
    renderPage()

    await screen.findByText('Buy milk')
    await user.click(screen.getByRole('button', { name: /Mark as done/i }))

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeDefined()
    })
  })

  test('deletes a todo', async () => {
    const user = userEvent.setup()
    db.todos = [{ id: '1', title: 'Buy milk', is_completed: false }]
    renderPage()

    await screen.findByText('Buy milk')
    await user.click(screen.getByRole('button', { name: /Remove/i }))

    await waitFor(() => {
      expect(screen.queryByText('Buy milk')).toBeNull()
    })
  })
})
