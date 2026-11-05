import { useCustomToast } from '@team-hermes/react-components'
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { toast as toastify } from 'react-toastify'
import { http, HttpResponse } from 'msw'
import { describe, expect, test, vi } from 'vite-plus/test'
import { ErrorPanel } from '@/shared/components/ErrorPanel/ErrorPanel'
import { configureApiClient, isApiError, type ApiError } from '@/shared/platform/api'
import { deleteTodoById } from '@/api-generated'
import { server } from '../../mocks/server'
import { createTelemetry, TelemetryBackend } from '@/shared/platform/telemetry'
import { createQueryClient } from './createQueryClient'
import { Providers } from './Providers'

const setup = () => {
  const { result } = renderHook(useCustomToast)
  const telemetry = createTelemetry(TelemetryBackend.None)
  const trackEvent = vi.spyOn(telemetry, 'trackEvent')
  const queryClient = createQueryClient({ telemetry, toast: result.current })
  configureApiClient({ telemetry })
  render(
    <Providers telemetry={telemetry} queryClient={queryClient} onReauthenticated={() => {}}>
      {null}
    </Providers>
  )
  return { toast: result.current, queryClient, trackEvent }
}

describe('Hermes notifications', () => {
  test('appends a toast and supports dismissal without changing other toasts', async () => {
    const { toast } = setup()
    act(() => toast.success('It worked'))
    expect(await screen.findByText('It worked')).toBeInTheDocument()
    act(() => toastify.dismiss('unknown'))
    expect(screen.getByText('It worked')).toBeInTheDocument()
    act(() => toastify.dismiss())
    // react-toastify waits for the exit animation before removing DOM nodes.
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })

  test('uses a longer auto-hide for errors than for success', async () => {
    const { toast } = setup()
    act(() => {
      toast.success('s')
      toast.error('e')
    })
    const success = (await screen.findByText('s')).closest('.Toastify__toast')
    const error = (await screen.findByText('e')).closest('.Toastify__toast')
    expect(success).not.toBeNull()
    expect(error).not.toBeNull()
    if (!success || !error) throw new Error('Toast container missing')
    expect(within(success as HTMLElement).getByRole('progressbar', { hidden: true })).toHaveStyle({
      animationDuration: '3000ms',
    })
    expect(within(error as HTMLElement).getByRole('progressbar', { hidden: true })).toHaveStyle({
      animationDuration: '8000ms',
    })
  })

  test('correlates an API error panel with the toast.error telemetry event', async () => {
    const { queryClient, trackEvent } = setup()
    let requestTraceId: string | null = null
    server.use(
      http.delete('http://localhost/todos/:id', ({ request }) => {
        requestTraceId = request.headers.get('x-trace-id')
        return HttpResponse.json({}, { status: 500, statusText: 'down' })
      })
    )
    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationFn: () => deleteTodoById({ path: { id: '1' }, throwOnError: true }),
      meta: { errorMessage: 'Could not save' },
    })
    await act(async () => {
      await expect(mutation.execute(undefined)).rejects.toMatchObject({ kind: 'http', status: 500, message: 'down' })
    })
    const error = mutation.state.error
    expect(isApiError(error)).toBe(true)
    if (!isApiError(error)) throw new Error('SDK did not preserve the Hermes ApiError shape')
    render(<ErrorPanel error={error} />)
    expect(await screen.findByText('Could not save')).toBeInTheDocument()
    expect(requestTraceId).toBeTruthy()
    expect(error.traceId).toBe(requestTraceId)
    expect(screen.getByText(error.traceId)).toBeInTheDocument()
    expect(trackEvent).toHaveBeenCalledWith('http.error', {
      kind: 'http',
      traceId: error.traceId,
      status: '500',
      url: 'http://localhost/todos/1',
    })
    expect(trackEvent).toHaveBeenCalledWith('toast.error', {
      kind: 'mutation',
      template: 'Could not save',
      traceId: error.traceId,
      errorKind: 'http',
      status: '500',
    })
  })

  test('suppresses 401 toasts and toast.error telemetry', async () => {
    const { queryClient, trackEvent } = setup()
    const error: ApiError = { kind: 'http', status: 401, traceId: 'auth', message: 'unauthorized' }
    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationFn: () => Promise.reject(error),
      meta: { errorMessage: 'Could not save' },
    })
    await act(async () => {
      await expect(mutation.execute(undefined)).rejects.toEqual(error)
    })
    expect(screen.queryByText('Could not save')).toBeNull()
    expect(trackEvent).not.toHaveBeenCalled()
  })
})
