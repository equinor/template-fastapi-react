import React from 'react'
import ReactDOM from 'react-dom/client'
import './app/styles/index.css'
import { App } from './app/App'
import { AppProviders } from './app/AppProviders'
import { registerGlobalErrorHandlers } from './shared/platform/telemetry/registerGlobalErrorHandlers'

registerGlobalErrorHandlers()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
)
