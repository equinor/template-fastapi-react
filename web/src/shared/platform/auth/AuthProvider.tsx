/**
 * Auth provider — the only place the OAuth SDK is referenced from React-land.
 * In dev mode (`VITE_AUTH` != '1') we skip the SDK entirely so the app
 * works against the docker-compose backend without any IDP.
 */

import type { ReactNode } from 'react'
import { AuthProvider as PkceAuthProvider } from 'react-oauth2-code-pkce'
import { ENV } from '@/config/env'
import { authConfig } from './auth'

export const AuthProvider = ({ children }: { children: ReactNode }) =>
  ENV.authEnabled ? <PkceAuthProvider authConfig={authConfig}>{children}</PkceAuthProvider> : children
