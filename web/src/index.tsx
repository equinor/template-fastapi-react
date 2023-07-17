import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { authConfig } from './auth'
import { AuthProvider } from 'react-oauth2-code-pkce'
import { OpenAPI } from './api/generated'

const hasAuthConfig = process.env.REACT_APP_AUTH === '1'

OpenAPI.BASE = `${window.location.origin}/api`

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    {hasAuthConfig ? (
      <AuthProvider authConfig={authConfig}>
        <App />
      </AuthProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
)
