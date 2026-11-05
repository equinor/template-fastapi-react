import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { Header } from './Header'

const signOut = vi.hoisted(() => vi.fn())
vi.mock('@/shared/platform/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/platform/auth')>()),
  useCurrentUser: () => ({ data: { id: 'alice', name: 'Alice', roles: ['default'] } }),
  useSignOut: () => signOut,
}))

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute('data-color-scheme')
})

const renderHeader = () => {
  const router = createRouter({
    routeTree: createRootRoute({ component: Header }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(<RouterProvider router={router} />)
  return userEvent.setup()
}

const showSupport = async (response: Response) => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response)
  const user = renderHeader()
  await user.click(await screen.findByRole('button', { name: 'Open Help and support dialog' }))
  return fetchMock
}

test('uses a router-aware home link, toggles dark mode, and signs out the current user', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('hash: abc\nrefs: main'))
  document.documentElement.setAttribute('data-color-scheme', 'light')
  const user = renderHeader()
  expect(await screen.findByRole('link', { name: 'Todo App' })).toHaveAttribute('href', '/')
  const toggle = screen.getByRole('button', { name: 'Dark mode' })
  expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await user.click(toggle)
  expect(toggle).toHaveAttribute('aria-pressed', 'true')
  expect(localStorage.getItem('color-scheme')).toBe('dark')
  await user.click(screen.getByRole('button', { name: 'Toggle user information popover' }))
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Sign out' }))
  expect(signOut).toHaveBeenCalledOnce()
})

test('renders refs, date and repository commit link in the Hermes support dialog', async () => {
  await showSupport(new Response('hash: abc123\ndate: 2026-05-04\nrefs: v1.2.3'))
  expect(await screen.findByRole('link', { name: 'v1.2.3' })).toHaveAttribute(
    'href',
    'https://github.com/equinor/template-fastapi-react/commit/abc123'
  )
  expect(screen.getByText(/\(2026-05-04\)/)).toBeInTheDocument()
})

// Hermes 1.11 fetches a route-relative literal, not the app's base URL.
test.fails('fetches version metadata relative to the application base on nested routes', async () => {
  const fetchMock = await showSupport(new Response('hash: abc123\nrefs: v1.2.3'))
  await waitFor(() => expect(fetchMock).toHaveBeenCalled())
  expect(fetchMock).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}version.txt`)
})

test.fails('falls back to hash when refs is missing', async () => {
  await showSupport(new Response('hash: deadbeef\ndate: 2026-05-04'))
  expect(await screen.findByRole('link', { name: 'deadbeef' })).toBeInTheDocument()
})

test.fails('shows unknown without a commit link when the response is not OK', async () => {
  await showSupport(new Response('', { status: 404 }))
  expect(await screen.findByText('unknown')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /undefined/ })).toBeNull()
})

test.fails('renders the label as plain text when there is no hash to link to', async () => {
  await showSupport(new Response('refs: v1.2.3\ndate: 2026-05-04'))
  expect(await screen.findByText('v1.2.3')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'v1.2.3' })).toBeNull()
})

test.fails('shows unknown when the version fetch rejects', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
  const user = renderHeader()
  await user.click(await screen.findByRole('button', { name: 'Open Help and support dialog' }))
  expect(await screen.findByText('unknown')).toBeInTheDocument()
})

test('ignores malformed lines while rendering valid version metadata', async () => {
  await showSupport(new Response('garbage line\nhash: cafef00d\nrefs: feature/x'))
  expect(await screen.findByRole('link', { name: 'feature/x' })).toBeInTheDocument()
})

// The Hermes NavBar uses a binary pressed button, not the old radio popover.
test.todo('restores the native radio selection and changes it with arrow keys (System option: upstream #94)')
