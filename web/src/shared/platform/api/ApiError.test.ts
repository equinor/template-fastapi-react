import { describe, expect, test } from 'vitest'
import { isApiError } from './ApiError'

describe('isApiError', () => {
  test('true for a well-formed network error', () => {
    expect(isApiError({ kind: 'network', traceId: 't1', message: 'offline' })).toBe(true)
  })

  test('true for a well-formed parse error', () => {
    expect(isApiError({ kind: 'parse', traceId: 't1', message: 'bad json' })).toBe(true)
  })

  test('true for a well-formed http error with numeric status', () => {
    expect(isApiError({ kind: 'http', status: 404, traceId: 't1', message: 'not found' })).toBe(true)
  })

  test('false for an http error missing a numeric status', () => {
    expect(isApiError({ kind: 'http', traceId: 't1', message: 'not found' })).toBe(false)
    expect(isApiError({ kind: 'http', status: '404', traceId: 't1', message: 'not found' })).toBe(false)
  })

  test('false for an unrecognised kind', () => {
    expect(isApiError({ kind: 'timeout', traceId: 't1', message: 'slow' })).toBe(false)
  })

  test('false when traceId or message is missing or the wrong type', () => {
    expect(isApiError({ kind: 'network', message: 'offline' })).toBe(false)
    expect(isApiError({ kind: 'network', traceId: 't1' })).toBe(false)
    expect(isApiError({ kind: 'network', traceId: 1, message: 'offline' })).toBe(false)
  })

  test('false for non-objects and null', () => {
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
    expect(isApiError('network')).toBe(false)
    expect(isApiError(new Error('boom'))).toBe(false)
  })
})
