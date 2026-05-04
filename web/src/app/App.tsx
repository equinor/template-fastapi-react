import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { RouterProvider } from 'react-router'
import { AuthGate } from './auth/AuthGate'
import { router } from './routing/router'

export const App = () => (
  <AuthGate>
    <NuqsAdapter>
      <RouterProvider router={router} />
    </NuqsAdapter>
  </AuthGate>
)
