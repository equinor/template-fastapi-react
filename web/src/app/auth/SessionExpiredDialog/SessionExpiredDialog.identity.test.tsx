/**
 * Re-auth may sign in a *different* account than the one whose data is
 * cached. The dialog must then drop the previous user's queries so the
 * route retry reloads data for the new identity instead of serving the
 * cached data through `ensureQueryData`.
 */

import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { act, render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { createQueryClient } from '@/app/bootstrap/createQueryClient'
import { Providers } from '@/app/bootstrap/Providers'
import { routerDefaults } from '@/app/bootstrap/routerDefaults'
import { routeTree } from '@/app/routeTree.gen'
import { type Todo, todoListQuery } from '@/features/todos'
import { AUTH_SUCCESS_MESSAGE, sessionExpiredStore, userQuery } from '@/shared/platform/auth'
import { createTelemetry, TelemetryBackend } from '@/shared/platform/telemetry'
import { db } from '../../../mocks/db'
import { server } from '../../../mocks/server'

vi.mock('@/config/env', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/config/env')>()
  return { ...original, ENV: { ...original.ENV, authEnabled: true } }
})

const telemetry = createTelemetry(TelemetryBackend.None)
const aliceTodo: Todo = { id: 'a', title: 'Alice task', user_id: 'alice', is_completed: false }
const bobTodo: Todo = { id: 'b', title: 'Bob task', user_id: 'bob', is_completed: false }

const signedInAs = (userId: string) =>
  server.use(http.get('http://localhost/whoami', () => HttpResponse.json({ user_id: userId, roles: ['default'] })))

// Load `/todos` as Alice, then expire the session with the dialog mounted.
const loadTodosAsAliceThenExpire = async () => {
  const queryClient = createQueryClient({ telemetry })
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/todos'] }),
    context: { queryClient, telemetry },
    ...routerDefaults,
  })
  signedInAs('alice')
  db.todos = [aliceTodo]
  await router.load()
  expect(queryClient.getQueryData(todoListQuery().queryKey)).toEqual([aliceTodo])

  const onReauthenticated = vi.fn(() => router.invalidate())
  render(
    <Providers queryClient={queryClient} telemetry={telemetry} onReauthenticated={onReauthenticated}>
      {null}
    </Providers>
  )
  act(() => sessionExpiredStore.notify())
  return { queryClient, router, onReauthenticated }
}

const completeReauth = async (onReauthenticated: ReturnType<typeof vi.fn>) => {
  await act(async () => {
    window.dispatchEvent(new MessageEvent('message', { data: AUTH_SUCCESS_MESSAGE, origin: window.location.origin }))
  })
  await waitFor(() => expect(onReauthenticated).toHaveBeenCalledOnce())
  // Wait for the route retry itself, not just the dialog dismissal.
  await act(async () => {
    await onReauthenticated.mock.results[0]?.value
  })
  expect(screen.queryByText('Session expired')).toBeNull()
}

afterEach(() => {
  act(() => sessionExpiredStore._reset())
  vi.restoreAllMocks()
})

describe('SessionExpiredDialog — identity changes', () => {
  test('signing back in as another user reloads the page with their data', async () => {
    const { queryClient, router, onReauthenticated } = await loadTodosAsAliceThenExpire()
    signedInAs('bob')
    db.todos = [bobTodo]

    await completeReauth(onReauthenticated)

    expect(queryClient.getQueryData(userQuery().queryKey)).toMatchObject({ id: 'bob' })
    expect(queryClient.getQueryData(todoListQuery().queryKey)).toEqual([bobTodo])
    expect(router.state.matches.every((match) => match.status === 'success')).toBe(true)
  })

  test('signing back in as the same user keeps the cached page data', async () => {
    const { queryClient, onReauthenticated } = await loadTodosAsAliceThenExpire()
    const cachedAt = queryClient.getQueryState(todoListQuery().queryKey)?.dataUpdatedAt

    await completeReauth(onReauthenticated)

    expect(queryClient.getQueryState(todoListQuery().queryKey)?.dataUpdatedAt).toBe(cachedAt)
  })
})
