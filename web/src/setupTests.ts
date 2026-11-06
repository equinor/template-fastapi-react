/// <reference types="vite-plus/test/jsdom" />
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { toast } from 'react-toastify'
import { afterAll, afterEach, beforeAll } from 'vite-plus/test'
import { resetDb } from './mocks/db'
import { server } from './mocks/server'
import { configureApiClient } from './shared/platform/api'
import { createTelemetry, TelemetryBackend } from './shared/platform/telemetry'

// The generated SDK uses the same Hermes telemetry contract as the app.
const testTelemetry = createTelemetry(TelemetryBackend.Console)

window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})

// Wire the generated SDK to httpClient with a test-safe baseUrl.
configureApiClient({ telemetry: testTelemetry })

// jsdom has no Popover API (used by EDS Tooltip/Dialog). Stub the methods
// so components that mount popovers don't crash during tests.
if (typeof HTMLElement !== 'undefined') {
  const proto = HTMLElement.prototype
  if (typeof proto.showPopover !== 'function') proto.showPopover = () => {}
  if (typeof proto.hidePopover !== 'function') proto.hidePopover = () => {}
  if (typeof proto.togglePopover !== 'function') proto.togglePopover = () => false
}

// jsdom doesn't implement the native <dialog> showModal/close. Polyfill
// just enough for SessionExpiredDialog: toggle the `open` attribute and
// fire the `cancel`/`close` events the component listens for.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype
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
  toast.dismiss()
  toast.clearWaitingQueue()
  server.resetHandlers()
  resetDb()
  localStorage.clear()
})
afterAll(() => server.close())
