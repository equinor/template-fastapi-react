/**
 * ErrorPanel renders titles based on `ApiError.kind` and surfaces the
 * traceId for log correlation. Unknown errors fall back to a generic
 * title and stringified message with no traceId.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vite-plus/test'
import { type ApiError, ErrorPanel } from '@team-hermes/react-components'

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

  test('treats an ApiError-like object with a missing status as unknown', () => {
    render(<ErrorPanel error={{ kind: 'http', traceId: 't', message: 'no status' }} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText(/undefined/)).toBeNull()
    expect(screen.queryByText(/Trace ID/)).toBeNull()
  })

  test('shows unknown plain objects as JSON instead of "[object Object]"', () => {
    render(<ErrorPanel error={{ detail: 'nope' }} />)
    expect(screen.getByText('{"detail":"nope"}')).toBeInTheDocument()
  })

  test('does not crash rendering an unknown error with a circular reference', () => {
    const circular: Record<string, unknown> = { a: 1 }
    circular.self = circular
    expect(() => render(<ErrorPanel error={circular} />)).not.toThrow()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('[object Object]')).toBeInTheDocument()
  })

  test('does not crash rendering an unknown error holding a BigInt', () => {
    expect(() => render(<ErrorPanel error={{ id: 1n }} />)).not.toThrow()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  // https://github.com/equinor/team-hermes-packages/pull/92
  test.fails('shows thrown strings verbatim, without JSON quotes', () => {
    render(<ErrorPanel error="oops" />)
    expect(screen.getByText('oops')).toBeInTheDocument()
  })

  test.fails('does not crash if both serialization and string coercion throw', () => {
    const error = {
      toJSON() {
        throw new Error('not serializable')
      },
      toString() {
        throw new Error('not coercible')
      },
    }
    expect(() => render(<ErrorPanel error={error} />)).not.toThrow()
  })
})
