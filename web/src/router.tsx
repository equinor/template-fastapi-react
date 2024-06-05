import { createBrowserRouter } from 'react-router-dom'
import InvalidUrl from './common/components/InvalidUrl'
import { TodoListPage } from './pages/TodoListPage'

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
