/**
 * `useSignOut()` — React-side wrapper around `signOut()` that injects
 * the active telemetry instance from context. Components using sign-out
 * (e.g. `Header`) call this once and use the returned callback as an
 * onClick handler.
 */

import { useCallback } from 'react'
import { useTelemetry } from '@/shared/platform/telemetry'
import { signOut as signOutImpl } from './redirects'

export const useSignOut = (): (() => void) => {
  const telemetry = useTelemetry()
  return useCallback(() => signOutImpl(telemetry), [telemetry])
}
