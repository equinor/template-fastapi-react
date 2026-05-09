// Public surface — for cross-feature imports only (e.g. `src/routes/`).
// Files inside this feature must use relative paths instead of importing from
// here; otherwise we get circular imports and the lazy-chunked page bundle
// pulls in everything reachable from this barrel.
//
// Enforced by the `no-restricted-imports` rule in `eslint.config.mts` —
// outside files cannot deep-import `@/features/<name>/...`.
//
// Code-splitting is now handled by the TanStack Router Vite plugin's
// `autoCodeSplitting` — the chunk boundary is the route file (`routes/index.tsx`),
// not the import path. Re-exporting `TodosPage` here is therefore safe.
export { todoListQuery } from './api'
export type { Todo } from './api/schema'
export { TodosPage } from './pages/TodosPage/TodosPage'
