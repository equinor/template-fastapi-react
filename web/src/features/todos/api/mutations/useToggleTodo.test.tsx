/**
 * Optimistic-toggle rollback must be scoped to the failed todo: a late
 * failure must not undo a different toggle that already succeeded.
 */

import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { ReactNode } from 'react'
import { expect, test, vi } from 'vite-plus/test'
import { createQueryClient } from '@/app/bootstrap/createQueryClient'
import { createTelemetry, TelemetryBackend } from '@/shared/platform/telemetry'
import { db } from '../../../../mocks/db'
import { server } from '../../../../mocks/server'
import { todoListQuery } from '../queries/todoListQuery'
import type { Todo } from '../schema'
import { useToggleTodo } from './useToggleTodo'

const telemetry = createTelemetry(TelemetryBackend.None)

test('a late failed toggle rolls back only its own todo', async () => {
  const first: Todo = { id: 'a', title: 'First', user_id: 'u1', is_completed: false }
  const second: Todo = { id: 'b', title: 'Second', user_id: 'u1', is_completed: false }
  db.todos = [first, second]
  let failFirst = () => {}
  const firstSettled = new Promise<void>((resolve) => {
    failFirst = resolve
  })
  server.use(
    http.put('http://localhost/todos/:id', async ({ params }) => {
      if (params.id === first.id) {
        await firstSettled
        return HttpResponse.json({ message: 'failed' }, { status: 500 })
      }
      db.todos = db.todos.map((t) => (t.id === second.id ? { ...t, is_completed: true } : t))
      return HttpResponse.json({ ...second, is_completed: true })
    })
  )
  const queryClient = createQueryClient({ telemetry, toast: { success: vi.fn(), error: vi.fn() } })
  await queryClient.fetchQuery(todoListQuery())
  const { result } = renderHook(
    () => ({
      list: useQuery(todoListQuery()),
      toggleFirst: useToggleTodo(),
      toggleSecond: useToggleTodo(),
    }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    }
  )

  act(() => result.current.toggleFirst.mutate(first))
  await waitFor(() => expect(result.current.list.data?.[0].is_completed).toBe(true))
  act(() => result.current.toggleSecond.mutate(second))
  await waitFor(() => expect(result.current.toggleSecond.isSuccess).toBe(true))
  await waitFor(() => expect(result.current.list.isFetching).toBe(false))

  act(failFirst)
  await waitFor(() => expect(result.current.toggleFirst.isError).toBe(true))

  expect(result.current.list.data?.map((t) => t.is_completed)).toEqual([false, true])
})
