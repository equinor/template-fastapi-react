/**
 * Wires the generated SDK client to the shared `httpClient`.
 *
 * Call `configureApiClient()` once at app start (`app/AppProviders` does
 * this) and once in `setupTests.ts`. An explicit function — instead of a
 * side-effect import — keeps the bootstrap order obvious and survives
 * tree-shaking / lint passes that flag bare imports.
 *
 * Auth tokens flow via `shared/platform/auth/auth.ts`'s `setToken()`,
 * not via `client.setConfig({ auth })`, so that `httpClient` controls all
 * outbound headers in one place.
 */

import { client } from '@/api-generated/client.gen'
import { httpClient } from './httpClient'

export const configureApiClient = () => {
  const isTest = typeof import.meta.env !== 'undefined' && import.meta.env.MODE === 'test'

  client.setConfig({
    // Tests have no browser origin; a dummy absolute URL prevents URL parse errors.
    baseUrl: isTest ? 'http://localhost' : `${window.location.origin}/api`,
    fetch: httpClient,
  })
}
