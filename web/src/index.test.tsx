import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vite-plus/test'

const { bootstrapError, rootRender, trackException } = vi.hoisted(() => ({
  bootstrapError: new Error('query client initialization failed'),
  rootRender: vi.fn(),
  trackException: vi.fn(),
}))

vi.mock('react-dom/client', () => ({
  createRoot: () => ({ render: rootRender, unmount: vi.fn() }),
}))

vi.mock('@team-hermes/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@team-hermes/react-components')>()
  return {
    ...actual,
    initColorScheme: vi.fn(),
    useCustomToast: () => ({ success: vi.fn(), error: vi.fn() }),
  }
})

vi.mock('./app/bootstrap/createQueryClient', () => ({
  createQueryClient: () => {
    throw bootstrapError
  },
}))

vi.mock('./app/routeTree.gen', () => ({ routeTree: {} }))
vi.mock('./shared/platform/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./shared/platform/api')>()),
  configureApiClient: vi.fn(),
}))
vi.mock('./shared/platform/auth', () => ({ startSessionWatcher: vi.fn() }))
vi.mock('./shared/platform/telemetry', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./shared/platform/telemetry')>()),
  createTelemetry: () => ({
    setUser: vi.fn(),
    trackEvent: vi.fn(),
    trackException,
  }),
  registerGlobalErrorHandlers: vi.fn(() => vi.fn()),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

test('the root telemetry boundary catches Application initialization errors once', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  document.body.innerHTML = '<div id="root"></div>'

  await import('./index')
  const rootElement = rootRender.mock.calls[0]?.[0]
  if (!rootElement) throw new Error('The application did not render into the root')

  render(rootElement)

  expect(await screen.findByRole('heading', { name: 'The application failed to load' })).toBeInTheDocument()
  expect(trackException).toHaveBeenCalledOnce()
  expect(trackException.mock.calls[0]?.[0]).toBe(bootstrapError)
})
