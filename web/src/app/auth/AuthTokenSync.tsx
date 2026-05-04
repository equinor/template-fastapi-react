/**
 * Bridges react-oauth2-code-pkce's hook-based token to the module-scoped
 * token holder in `shared/platform/auth/auth.ts`. `httpClient` reads from
 * that holder synchronously on every request — so it doesn't need to be
 * a hook and doesn't need React context.
 */

import { useEffect } from 'react'
import { setToken } from '@/shared/platform/auth/auth'
import { useAuthSession } from '@/shared/platform/auth/useAuthSession'

export const AuthTokenSync = () => {
  const { token } = useAuthSession()

  useEffect(() => {
    setToken(token)
  }, [token])

  return null
}
