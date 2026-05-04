// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetDb } from './mocks/db'
import { server } from './mocks/server'
import { configureApiClient } from './shared/api/apiClient'

// Wire the generated SDK to httpClient with a test-safe baseUrl.
configureApiClient()

// jsdom has no Popover API (used by EDS Tooltip/Dialog). Stub the methods
// so components that mount popovers don't crash during tests.
if (typeof HTMLElement !== 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: jsdom polyfill
  const proto = HTMLElement.prototype as any
  if (typeof proto.showPopover !== 'function') proto.showPopover = () => {}
  if (typeof proto.hidePopover !== 'function') proto.hidePopover = () => {}
  if (typeof proto.togglePopover !== 'function') proto.togglePopover = () => {}
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
})
afterAll(() => server.close())
