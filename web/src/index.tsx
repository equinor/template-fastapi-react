import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { authConfig } from './auth'
import { AuthProvider } from 'react-oauth2-code-pkce'

const hasAuthConfig = process.env.REACT_APP_AUTH === '1'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <>
      {hasAuthConfig ? (
        <AuthProvider authConfig={authConfig}>
          <App />
        </AuthProvider>
      ) : (
        <App />
      )}
    </>
  </React.StrictMode>
)
