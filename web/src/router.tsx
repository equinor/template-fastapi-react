import { createBrowserRouter } from 'react-router-dom'
import { TodoListPage } from './pages/TodoListPage'
import InvalidUrl from './common/components/InvalidUrl'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TodoListPage />,
  },
  {
    path: '*',
    element: <InvalidUrl />,
  },
])
