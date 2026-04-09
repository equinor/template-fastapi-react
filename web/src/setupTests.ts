// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { client } from './api/generated/client.gen'

// @hey-api/client-fetch requires an absolute URL for the base; in tests there's
// no browser origin, so we provide a dummy to prevent URL parse errors.
client.setConfig({
  baseUrl: 'http://localhost',
})

afterEach(() => {
  cleanup()
})
