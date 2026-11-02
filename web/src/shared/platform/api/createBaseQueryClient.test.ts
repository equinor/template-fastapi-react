/**
 * Cross-cutting QueryClient policy: which errors are retried, and when
 * mutation/query `meta` triggers notifications and invalidation.
 */

import { QueryClient } from '@tanstack/react-query'
import { describe, expect, test, vi } from 'vitest'
import { createBaseQueryClient, noopNotifier } from './createBaseQueryClient'
import type { ApiError } from './types'

const httpError = (status: number): ApiError => ({
  kind: 'http',
  status,
  traceId: 'trace-1',
  message: 'boom',
})

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('createBaseQueryClient — retry policy', () => {
  test('queries retry once on a generic (retryable) error', async () => {
    let attempts = 0
    const client = createBaseQueryClient()
    await client
      .fetchQuery({
        queryKey: ['retryable'],
        queryFn: () => {
          attempts += 1
          throw httpError(500)
        },
        // Only the retry *count* is under test; skip the default 1s backoff.
        retryDelay: 0,
      })
      .catch(() => {})
    expect(attempts).toBe(2) // initial attempt + 1 retry
    client.clear()
  })

  test.each([401, 403, 404])('queries do NOT retry on a %d error', async (status) => {
    let attempts = 0
    const client = createBaseQueryClient()
    await client
      .fetchQuery({
        queryKey: ['non-retryable', status],
        queryFn: () => {
          attempts += 1
          throw httpError(status)
        },
        retryDelay: 0,
      })
      .catch(() => {})
    expect(attempts).toBe(1)
    client.clear()
  })

  test('mutations never retry, even on a generic error', async () => {
    let attempts = 0
    const client = createBaseQueryClient()
    const mutation = client.getMutationCache().build(client, {
      mutationFn: () => {
        attempts += 1
        throw httpError(500)
      },
      retryDelay: 0,
    })
    await mutation.execute(undefined).catch(() => {})
    expect(attempts).toBe(1)
    client.clear()
  })
})

describe('createBaseQueryClient — mutation notifications', () => {
  test('fires notifier.success and invalidates on successful mutation with meta', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() }
    const client = createBaseQueryClient({ notifier })
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    const mutation = client.getMutationCache().build(client, {
      mutationFn: () => Promise.resolve('ok'),
      meta: { successMessage: 'Saved!', invalidates: [['thing']] },
    })
    await mutation.execute(undefined)

    expect(notifier.success).toHaveBeenCalledWith('Saved!')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['thing'] })
    client.clear()
  })

  test('does not notify success when skipNotification is set', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() }
    const client = createBaseQueryClient({ notifier })

    const mutation = client.getMutationCache().build(client, {
      mutationFn: () => Promise.resolve('ok'),
      meta: { successMessage: 'Saved!', skipNotification: true },
    })
    await mutation.execute(undefined)

    expect(notifier.success).not.toHaveBeenCalled()
    client.clear()
  })

  test("fires notifier.error with source='mutation' on failure", async () => {
    const notifier = { success: vi.fn(), error: vi.fn() }
    const client = createBaseQueryClient({ notifier })
    const error = httpError(500)

    const mutation = client.getMutationCache().build(client, {
      mutationFn: () => Promise.reject(error),
      meta: { errorMessage: 'Save failed' },
    })
    await mutation.execute(undefined).catch(() => {})

    expect(notifier.error).toHaveBeenCalledWith('Save failed', { error, source: 'mutation' })
    client.clear()
  })

  test('suppressNotification prevents the mutation error notifier from firing', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() }
    const error = httpError(401)
    const client = createBaseQueryClient({
      notifier,
      suppressNotification: (e) => e === error,
    })

    const mutation = client.getMutationCache().build(client, {
      mutationFn: () => Promise.reject(error),
      meta: { errorMessage: 'Save failed' },
    })
    await mutation.execute(undefined).catch(() => {})

    expect(notifier.error).not.toHaveBeenCalled()
    client.clear()
  })
})

describe('createBaseQueryClient — query notifications', () => {
  test('does not notify on the initial load failure (no cached data yet)', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() }
    const client = createBaseQueryClient({ notifier })

    await client
      .fetchQuery({
        queryKey: ['initial-load'],
        queryFn: () => Promise.reject(httpError(404)),
        meta: { errorMessage: 'Failed to load' },
      })
      .catch(() => {})

    expect(notifier.error).not.toHaveBeenCalled()
    client.clear()
  })

  test('notifies on a refetch failure once data is already cached', async () => {
    const notifier = { success: vi.fn(), error: vi.fn() }
    const client = createBaseQueryClient({ notifier })
    const queryKey = ['refetch-fails']

    // Seed the cache directly so this test doesn't depend on the retry
    // delay/backoff of a real failing-then-succeeding fetchQuery.
    client.setQueryData(queryKey, 'cached-value')

    await client
      .fetchQuery({
        queryKey,
        queryFn: () => Promise.reject(httpError(500)),
        meta: { errorMessage: 'Refetch failed' },
        retry: false,
        // Cached data is fresh (default staleTime is 30s), so without
        // this override fetchQuery would short-circuit and never call
        // queryFn at all.
        staleTime: 0,
      })
      .catch(() => {})

    await flush()
    expect(notifier.error).toHaveBeenCalledWith('Refetch failed', {
      error: expect.objectContaining({ status: 500 }),
      source: 'query',
    })
    client.clear()
  })
})

describe('noopNotifier', () => {
  test('is a no-op safe default for both success and error', () => {
    expect(() => noopNotifier.success('x')).not.toThrow()
    expect(() => noopNotifier.error('x', { error: new Error('y'), source: 'query' })).not.toThrow()
  })
})

describe('QueryClient defaults', () => {
  test('createBaseQueryClient returns a real QueryClient instance', () => {
    const client = createBaseQueryClient()
    expect(client).toBeInstanceOf(QueryClient)
    client.clear()
  })
})
