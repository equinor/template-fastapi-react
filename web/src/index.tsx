import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from 'react-oauth2-code-pkce'
import App from './App'
import { client } from './api/generated/client.gen'
import { authConfig } from './auth'

const hasAuthConfig = import.meta.env.VITE_AUTH === '1'

client.setConfig({
  baseUrl: `${window.location.origin}/api`,
})

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
