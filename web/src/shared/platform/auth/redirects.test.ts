import { afterEach, expect, test, vi } from 'vitest'
import type { Telemetry } from '@/shared/platform/telemetry'
import { signIn, signOut } from './redirects'

afterEach(() => vi.unstubAllGlobals())

const stubLocation = () => {
  const assign = vi.fn()
  vi.stubGlobal('location', { pathname: '/todos', search: '?status=done', hash: '#task', assign })
  return assign
}

test('sign-in returns to the current page with its search and hash', () => {
  const assign = stubLocation()
  signIn()
  expect(assign).toHaveBeenCalledWith('/oauth2/sign_in?rd=%2Ftodos%3Fstatus%3Ddone%23task')
})

test('sign-out clears telemetry identity and lands outside the protected SPA', () => {
  const assign = stubLocation()
  const telemetry: Telemetry = { setUser: vi.fn(), trackException: vi.fn(), trackEvent: vi.fn() }
  signOut(telemetry)
  expect(telemetry.setUser).toHaveBeenCalledWith(null)
  expect(assign).toHaveBeenCalledWith('/oauth2/sign_out?rd=%2Fsigned-out.html')
})
