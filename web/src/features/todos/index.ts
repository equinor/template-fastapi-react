// Public surface — for cross-feature imports only (e.g. `app/routing/router.tsx`).
// Files inside this feature must use relative paths instead of importing from
// here; otherwise we get circular imports and the lazy-chunked page bundle
// pulls in everything reachable from this barrel.
export { todoListQuery } from './api'
export { TodosPage } from './pages/TodosPage/TodosPage'
