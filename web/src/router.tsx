import { createHashRouter } from 'react-router-dom'
import { TodoListPage } from './pages/TodoListPage'
import InvalidUrl from './common/components/InvalidUrl'

export const router = createHashRouter([
  {
    path: '/',
    element: <TodoListPage />,
  },
  {
    path: '*',
    element: <InvalidUrl />,
  },
])
