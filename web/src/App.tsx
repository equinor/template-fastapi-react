import { TodoApp } from './components/TodoApp'
import { AuthProvider } from 'react-oauth2-code-pkce'
import { authConfig } from './auth'

const hasUnsafeAuthConfig = process.env.REACT_APP_AUTH !== '1'

function App() {
  return hasUnsafeAuthConfig ? (
    <TodoApp />
  ) : (
    <AuthProvider authConfig={authConfig}>
      <TodoApp />
    </AuthProvider>
  )
}

export default App
