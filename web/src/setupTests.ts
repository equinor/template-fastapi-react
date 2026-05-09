// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetDb } from './mocks/db'
import { server } from './mocks/server'
import { configureApiClient } from './shared/platform/api'
import { createTelemetry, TelemetryBackend } from './shared/platform/telemetry'

// Build a console telemetry instance for tests so the few assertions
// that spy on `console` have something to observe, and pass it to the
// SDK wiring. Tests that mount `<AppProviders>` use `appTelemetry` from
// `app/telemetry.ts` directly — both instances share the same console
// backend so assertions are stable either way.
const testTelemetry = createTelemetry(TelemetryBackend.Console)

// Wire the generated SDK to httpClient with a test-safe baseUrl.
configureApiClient({ telemetry: testTelemetry })

// jsdom has no Popover API (used by EDS Tooltip/Dialog). Stub the methods
// so components that mount popovers don't crash during tests.
if (typeof HTMLElement !== 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: jsdom polyfill
  const proto = HTMLElement.prototype as any
  if (typeof proto.showPopover !== 'function') proto.showPopover = () => {}
  if (typeof proto.hidePopover !== 'function') proto.hidePopover = () => {}
  if (typeof proto.togglePopover !== 'function') proto.togglePopover = () => {}
}

// jsdom doesn't implement the native <dialog> showModal/close. Polyfill
// just enough for SessionExpiredDialog: toggle the `open` attribute and
// fire the `cancel`/`close` events the component listens for.
if (typeof HTMLDialogElement !== 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: jsdom polyfill
  const proto = HTMLDialogElement.prototype as any
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function () {
      this.setAttribute('open', '')
    }
  }
  if (typeof proto.close !== 'function') {
    proto.close = function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
})
afterAll(() => server.close())
