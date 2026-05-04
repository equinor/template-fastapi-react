/**
 * Locks the meta-driven toast pipeline end-to-end:
 *   useDeleteTodo (meta.successMessage)
 *     → MutationCache.onSuccess in shared/api/queryClient
 *     → toast.success → toastStore
 *     → ToastContainer (mounted by AppProviders)
 *
 * If anyone breaks any link in that chain, this test fails. The unit
 * tests in `shared/platform/toast/toastStore.test.ts` cover the store in
 * isolation; this one proves the wiring.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { Suspense } from 'react'
import { beforeEach, describe, expect, test } from 'vitest'
import { AppProviders } from '../../../../app/AppProviders'
import { db } from '../../../../mocks/db'
import { setCurrentUserForTests } from '../../../../shared/platform/auth/auth'
import { toastStore } from '../../../../shared/platform/toast/toastStore'
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

describe('TodosPage — toast wiring', () => {
  beforeEach(() => {
    setCurrentUserForTests({
      id: 'anonymous',
      name: 'Local developer',
      roles: ['admin'],
    })
    toastStore._reset()
  })

  test('shows a success toast after deleting a todo', async () => {
    const user = userEvent.setup()
    db.todos = [{ id: '1', title: 'Buy milk', is_completed: false }]
    renderPage()

    await screen.findByText('Buy milk')
    await user.click(screen.getByRole('button', { name: /Remove/i }))

    const toast = await waitFor(() => screen.getByTestId('toast-success'))
    expect(toast.textContent).toContain('Todo deleted')
  })
})
