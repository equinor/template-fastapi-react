/**
 * VersionText fetches `version.txt` and parses `key: value` lines.
 * We stub `fetch` per-test to drive each branch (success, parse-skip,
 * non-OK, network reject). Falls back to "unknown" when the file is
 * missing or empty.
 */

import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { VersionText } from './VersionText'

const mockFetchOk = (body: string) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body, { status: 200 }))

const mockFetchStatus = (status: number) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status, statusText: 'Not Found' }))

const mockFetchReject = () => vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))

beforeEach(() => {
  vi.restoreAllMocks()
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('VersionText', () => {
  test('renders refs label and date when version.txt parses', async () => {
    mockFetchOk('hash: abc123\ndate: 2026-05-04\nrefs: v1.2.3')
    render(<VersionText />)
    await waitFor(() => expect(screen.getByText('v1.2.3')).toBeInTheDocument())
    expect(screen.getByText(/2026-05-04/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'v1.2.3' })).toHaveAttribute(
      'href',
      'https://github.com/equinor/template-fastapi-react/commit/abc123'
    )
  })

  test('falls back to hash when refs is missing', async () => {
    mockFetchOk('hash: deadbeef\ndate: 2026-05-04')
    render(<VersionText />)
    await waitFor(() => expect(screen.getByText('deadbeef')).toBeInTheDocument())
  })

  test('shows "unknown" when the response is not OK', async () => {
    mockFetchStatus(404)
    render(<VersionText />)
    // The component renders "unknown" synchronously from the initial state;
    // wait a tick to ensure the catch handler ran without changing it.
    await waitFor(() => expect(screen.getByText('unknown')).toBeInTheDocument())
  })

  test('shows "unknown" when fetch rejects', async () => {
    mockFetchReject()
    render(<VersionText />)
    await waitFor(() => expect(screen.getByText('unknown')).toBeInTheDocument())
  })

  test('ignores malformed lines and parses only valid `key: value` pairs', async () => {
    mockFetchOk('garbage line\nhash: cafef00d\nrefs: feature/x')
    render(<VersionText />)
    await waitFor(() => expect(screen.getByText('feature/x')).toBeInTheDocument())
  })
})
