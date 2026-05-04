import { render, screen } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/app/AppProviders'
import { RootLayout } from '@/app/layout/RootLayout'
import { TodosPage } from '@/features/todos'

// Each test gets its own router instance — the production router in
// `app/routing/router.tsx` is a module-level singleton whose loader state would
// otherwise leak between renders.
const renderApp = () => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RootLayout />,
        children: [{ index: true, element: <TodosPage /> }],
      },
    ],
    { initialEntries: ['/'] }
  )
  return render(
    <AppProviders>
      <NuqsTestingAdapter>
        <RouterProvider router={router} />
      </NuqsTestingAdapter>
    </AppProviders>
  )
}

test('renders without crashing', () => {
  renderApp()
})
test('has an input field', async () => {
  renderApp()
  expect(await screen.findByPlaceholderText('Add Task')).toBeDefined()
})
test('has an Add button', async () => {
  renderApp()
  expect(await screen.findByText('Add')).toBeDefined()
})
