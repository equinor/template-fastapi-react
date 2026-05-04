/**
 * Feature-level integration test: renders TodosPage inside `AppProviders`
 * (real QueryClient + httpClient + MSW) and exercises the create flow.
 *
 * This is the layer where most tests should live — exercising real data
 * flow with mocked network, not mocked hooks.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { Suspense } from 'react'
import { beforeEach, describe, expect, test } from 'vitest'
import { AppProviders } from '../../../../app/AppProviders'
import { db } from '../../../../mocks/db'
import { queryClient } from '../../../../shared/api/queryClient'
import { TodosPage } from './TodosPage'

const renderPage = (searchParams?: string) =>
  render(
    <AppProviders>
      <NuqsTestingAdapter searchParams={searchParams}>
        <Suspense fallback={<div>Loading…</div>}>
          <TodosPage />
        </Suspense>
      </NuqsTestingAdapter>
    </AppProviders>
  )

describe('TodosPage', () => {
  beforeEach(() => {
    queryClient.clear()
  })
  test('renders existing todos from the API', async () => {
    db.todos = [
      { id: '1', title: 'Buy milk', is_completed: false },
      { id: '2', title: 'Walk dog', is_completed: true },
    ]

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeDefined()
      expect(screen.getByText('Walk dog')).toBeDefined()
    })
  })

  test('adds a new todo via the form', async () => {
    const user = userEvent.setup()
    renderPage()

    const input = await screen.findByPlaceholderText('Add Task')
    await user.type(input, 'Write docs')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(screen.getByText('Write docs')).toBeDefined()
    })
  })

  test('filters todos by status from the URL', async () => {
    db.todos = [
      { id: '1', title: 'Buy milk', is_completed: false },
      { id: '2', title: 'Walk dog', is_completed: true },
    ]

    renderPage('?status=done')

    await waitFor(() => {
      expect(screen.getByText('Walk dog')).toBeDefined()
    })
    expect(screen.queryByText('Buy milk')).toBeNull()
  })

  test('changing the filter hides non-matching todos', async () => {
    const user = userEvent.setup()
    db.todos = [
      { id: '1', title: 'Buy milk', is_completed: false },
      { id: '2', title: 'Walk dog', is_completed: true },
    ]

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeDefined()
    })

    await user.click(screen.getByLabelText('Active'))

    await waitFor(() => {
      expect(screen.queryByText('Walk dog')).toBeNull()
    })
    expect(screen.getByText('Buy milk')).toBeDefined()
  })
})
