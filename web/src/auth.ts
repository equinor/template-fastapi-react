import { TAuthConfig } from 'react-oauth2-code-pkce'

export const authConfig: TAuthConfig = {
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID || '',
  authorizationEndpoint: import.meta.env.VITE_AUTH_ENDPOINT || '',
  tokenEndpoint: import.meta.env.VITE_TOKEN_ENDPOINT || '',
  scope: import.meta.env.VITE_AUTH_SCOPE || '',
  redirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI || '',
  logoutEndpoint: import.meta.env.VITE_LOGOUT_ENDPOINT || '',
  autoLogin: false,
  preLogin: () =>
    localStorage.setItem(
      'preLoginPath',
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    ),
  postLogin: () =>
    window.location.replace(
      localStorage.getItem('preLoginPath') ??
        (import.meta.env.VITE_AUTH_REDIRECT_URI || '')
    ),
}
