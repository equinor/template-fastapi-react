/**
 * ErrorPanel renders titles based on `ApiError.kind` and surfaces the
 * traceId for log correlation. Unknown errors fall back to a generic
 * title and stringified message with no traceId.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import type { ApiError } from '../api/ApiError'
import { ErrorPanel } from './ErrorPanel'

describe('ErrorPanel', () => {
  test('renders a network error with traceId', () => {
    const err: ApiError = {
      kind: 'network',
      traceId: 'trace-1',
      message: 'offline',
    }
    render(<ErrorPanel error={err} />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByText('offline')).toBeInTheDocument()
    expect(screen.getByText('trace-1')).toBeInTheDocument()
  })

  test('maps http 403 to "Not allowed"', () => {
    const err: ApiError = {
      kind: 'http',
      status: 403,
      traceId: 't',
      message: 'forbidden',
    }
    render(<ErrorPanel error={err} />)
    expect(screen.getByText('Not allowed')).toBeInTheDocument()
  })

  test('maps http 404 to "Not found"', () => {
    const err: ApiError = {
      kind: 'http',
      status: 404,
      traceId: 't',
      message: 'missing',
    }
    render(<ErrorPanel error={err} />)
    expect(screen.getByText('Not found')).toBeInTheDocument()
  })

  test('maps http 5xx to "Server error"', () => {
    const err: ApiError = {
      kind: 'http',
      status: 503,
      traceId: 't',
      message: 'down',
    }
    render(<ErrorPanel error={err} />)
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  test('maps other http statuses to a generic "Request failed (N)" label', () => {
    const err: ApiError = {
      kind: 'http',
      status: 418,
      traceId: 't',
      message: 'teapot',
    }
    render(<ErrorPanel error={err} />)
    expect(screen.getByText('Request failed (418)')).toBeInTheDocument()
  })

  test('renders parse errors with their own title', () => {
    const err: ApiError = { kind: 'parse', traceId: 't', message: 'bad json' }
    render(<ErrorPanel error={err} />)
    expect(screen.getByText('Unexpected response from server')).toBeInTheDocument()
  })

  test('falls back to a generic title for unknown errors and omits the traceId', () => {
    render(<ErrorPanel error={new Error('boom')} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/boom/)).toBeInTheDocument()
    expect(screen.queryByText(/traceId/)).toBeNull()
  })
})
