import App from './App'
import React from 'react'
import ReactDOM from 'react-dom'
import { AuthContext, AuthProvider, TAuthConfig } from 'react-oauth2-code-pkce'

const authEnabled = process.env.REACT_APP_AUTH === '1'

const authConfig = {
  clientId: process.env.REACT_APP_AUTH_CLIENT_ID || '',
  authorizationEndpoint: process.env.REACT_APP_AUTH_ENDPOINT || '',
  tokenEndpoint: process.env.REACT_APP_TOKEN_ENDPOINT || '',
  scope: process.env.REACT_APP_AUTH_SCOPE || '',
  redirectUri: process.env.REACT_APP_AUTH_REDIRECT_URI || '',
  logoutEndpoint: process.env.REACT_APP_LOGOUT_ENDPOINT || '',
  preLogin: () =>
    localStorage.setItem(
      'preLoginPath',
      `${window.location.pathname}${window.location.search}${window.location.hash}`
    ),
  postLogin: () =>
    // @ts-ignore
    window.location.replace(localStorage.getItem('preLoginPath')),
}

const Entrypoint = () => {
  if (!authEnabled) {
    return <App />
  }
  return (
    <AuthProvider authConfig={authConfig}>
      <App />
    </AuthProvider>
  )
}

ReactDOM.render(<Entrypoint />, document.getElementById('app'))
