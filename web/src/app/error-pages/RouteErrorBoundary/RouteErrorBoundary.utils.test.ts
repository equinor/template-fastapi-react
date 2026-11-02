import { describe, expect, test } from 'vitest'
import { isExpectedClientError, statusOf } from './RouteErrorBoundary.utils'

describe('statusOf', () => {
  test('reads status from a Response instance', () => {
    expect(statusOf(new Response(null, { status: 403 }))).toBe(403)
  })

  test('reads status from an http ApiError', () => {
    expect(statusOf({ kind: 'http', status: 401, traceId: 't1', message: 'unauthorized' })).toBe(401)
  })

  test('returns null for non-http ApiErrors', () => {
    expect(statusOf({ kind: 'network', traceId: 't1', message: 'offline' })).toBeNull()
    expect(statusOf({ kind: 'parse', traceId: 't1', message: 'bad json' })).toBeNull()
  })

  test('returns 404 for a TanStack Router NotFoundError-shaped object', () => {
    expect(statusOf({ name: 'NotFoundError' })).toBe(404)
  })

  test('returns null for anything else (plain Error, string, undefined)', () => {
    expect(statusOf(new Error('boom'))).toBeNull()
    expect(statusOf('boom')).toBeNull()
    expect(statusOf(undefined)).toBeNull()
    expect(statusOf({ name: 'SomethingElse' })).toBeNull()
  })
})

describe('isExpectedClientError', () => {
  test('true for 4xx statuses', () => {
    expect(isExpectedClientError(new Response(null, { status: 400 }))).toBe(true)
    expect(isExpectedClientError(new Response(null, { status: 404 }))).toBe(true)
    expect(isExpectedClientError(new Response(null, { status: 499 }))).toBe(true)
    expect(isExpectedClientError({ kind: 'http', status: 401, traceId: 't1', message: 'unauthorized' })).toBe(true)
  })

  test('false for 5xx and other statuses', () => {
    expect(isExpectedClientError(new Response(null, { status: 500 }))).toBe(false)
    expect(isExpectedClientError(new Response(null, { status: 200 }))).toBe(false)
    expect(isExpectedClientError({ kind: 'http', status: 503, traceId: 't1', message: 'unavailable' })).toBe(false)
  })

  test('false when there is no resolvable status', () => {
    expect(isExpectedClientError(new Error('boom'))).toBe(false)
    expect(isExpectedClientError(undefined)).toBe(false)
  })
})
