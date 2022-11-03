import { router } from './router'
import { RouterProvider } from 'react-router-dom'
import Header from './common/components/Header'

function App() {
  return (
    <>
      <Header />
      <RouterProvider router={router} />
    </>
  )
}

export default App
