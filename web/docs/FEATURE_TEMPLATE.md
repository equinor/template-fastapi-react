# Feature template

Canonical layout for a feature in `web/src/features/<name>/`, extracted
from the `todos` feature. Follow it when adding a new feature so the
patterns the platform code already assumes (cache keys, invalidations,
metadata-driven toasts, loader-primed queries, permission gating) keep
working without surprises.

## Folder layout

```text
src/features/<name>/
├── index.ts                       # Public barrel — the ONLY entry from outside
├── pages/<Name>Page/
│   ├── <Name>Page.tsx             # Composition only; no business logic
│   ├── <Name>Page.hooks.ts        # URL state + derived selectors
│   ├── <Name>Page.utils.ts        # Pure helpers
│   ├── <Name>Page.test.tsx        # Happy-path integration test
│   ├── <Name>Page.mutations.test.tsx
│   ├── <Name>Page.error.test.tsx
│   ├── <Name>Page.toast.test.tsx
│   └── components/                # Presentational pieces, feature-private
└── api/
    ├── index.ts                   # Re-exports queries + mutations + types
    ├── schema.ts                  # Re-exports Zod schemas + types from `api-generated`
    ├── keys.ts                    # `xKeys.lists()` aliases generated query keys
    ├── invalidations.ts           # Single source of truth for cache busting
    ├── queries/                   # `queryOptions` factories + thin hook wrappers
    └── mutations/                 # `useMutation` wrappers with metadata
```

## Public barrel — only entry point

`features/<name>/index.ts` exports the small surface that the rest of
the app needs (query options factory used by the route loader, the
public domain type, and a lazy-loader for the page so the router can
code-split it). Nothing else.

```ts
// features/todos/index.ts
export { todoListQuery } from './api'
export type { Todo } from './api/schema'
export { createTodosLoader as createTodosPageLoader } from './pages/TodosPage/TodosPage.route'

// Code-split entry. The page component is exposed ONLY through this
// dynamic-import factory — adding a static `export { TodosPage }`
// would defeat code-splitting (Vite warns `INEFFECTIVE_DYNAMIC_IMPORT`
// and pulls the module into the main chunk). Tests `await TodosPageLazy()`.
export const TodosPageLazy = () => import('./pages/TodosPage/TodosPage')
```

This is enforced at lint time by `no-restricted-imports` in
[eslint.config.mts](../eslint.config.mts): outside code may not write
`@/features/<name>/api/...`. Inside the feature, use relative paths —
deep imports through `@/features/<name>` create circular dependencies
because the barrel reaches back into the feature.

## Router wiring — lazy by default

Add the page to [src/app/routing/router.tsx](../src/app/routing/router.tsx)
using React Router v7's `lazy` option so the page module ships in its
own chunk. Keep the loader eager so the data fetch starts in parallel
with the chunk download.

```ts
{
  path: 'name',
  loader: createNamePageLoader(queryClient),
  lazy: async () => {
    const { NamePage } = await NamePageLazy()
    return { Component: tracked(NamePage, 'NamePage') }
  },
  errorElement: <RouteErrorBoundary />,
}
```

## Query options factory — loader + component share the cache

The route loader pre-populates the cache so the component renders
without a waterfall. Both call the same factory so they produce
identical query keys.

```ts
// api/queries/todoListQuery.ts
import { queryOptions } from '@tanstack/react-query'
import { getAllTodosOptions } from '@/api-generated/@tanstack/react-query.gen'

export const todoListQuery = () =>
  queryOptions({
    ...getAllTodosOptions(),
    meta: { errorMessage: 'Could not load todos' },
  })
```

```tsx
// In the route loader
await queryClient.ensureQueryData(todoListQuery())

// In the page component
const { data } = useSuspenseQuery(todoListQuery())
```

## Mutation metadata — automatic invalidation + toasts

`app/queryClient.ts` (and the underlying `shared/platform/api/createQueryClient.ts`)
read `meta` on mutations and queries. Mutations declare what they
invalidate and what to toast; the `MutationCache` does the rest.

```ts
// api/mutations/useCreateTodo.ts
import { useMutation } from '@tanstack/react-query'
import { addTodoMutation } from '@/api-generated/@tanstack/react-query.gen'
import { onCreateTodo } from '../invalidations'

export const useCreateTodo = () =>
  useMutation({
    ...addTodoMutation(),
    meta: {
      invalidates: onCreateTodo(),
      successMessage: 'Todo created',
      errorMessage: 'Could not create todo',
    },
  })
```

Supported `meta` keys: `invalidates`, `successMessage`, `errorMessage`,
`skipNotification`. See [shared/platform/api/createQueryClient.ts](../src/shared/platform/api/createQueryClient.ts)
and [app/queryClient.ts](../src/app/queryClient.ts) for the
app-level wiring (toast + telemetry).

## Centralised invalidations

Every mutation goes through `api/invalidations.ts`. One file, one
review surface — no hunting through hooks to discover what becomes
stale after a write.

```ts
// api/invalidations.ts
import { todoKeys } from './keys'
export const onCreateTodo = () => [todoKeys.lists()]
export const onToggleTodo = () => [todoKeys.lists()]
export const onDeleteTodo = () => [todoKeys.lists()]
```

## Schema reuse — generated → form

Forms validate with the same Zod schemas the SDK was generated from.
No drift between client validation and the request the server expects.

```tsx
// In a form component
import { zAddTodoRequest } from '@/api-generated/zod.gen'

const formSchema = z.object({
  title: z.string().trim().pipe(zAddTodoRequest.shape.title),
})
```

## Permission gating — loader + UI hint

Hard gate in the route loader (so URL/back behaviour stays correct);
soft hint in the UI (so unavailable controls hide rather than 403).

```ts
// In the loader
const user = await queryClient.ensureQueryData(userQuery())
if (hasPermissionCheck(user, 'todos', 'read') !== true) {
  throw new Response(null, { status: 403 })
}
```

```tsx
// In a component (UI hint only — server still enforces)
const canUpdate = hasPermissionCheck(user, 'todos', 'update', todo) === true
```

See [config/accessControl.ts](../src/config/accessControl.ts) for how
roles, predicates, and ownership data are typed.

## URL state — `nuqs` in `*.hooks.ts`

Filters and similar UI state belong in the URL so refresh and
deep-linking work. Wrap in a hook colocated with the page so the page
component stays declarative.

```ts
// pages/TodosPage/TodosPage.hooks.ts
import { useQueryState } from 'nuqs'

export const useTodosFilter = () => {
  const [status, setStatus] = useQueryState('status', statusParser)
  // ... derived state with useMemo, stable callbacks with useCallback
}
```

## Error handling

Three complementary boundaries:

1. **Route `errorElement`** — always present in the router config. The
   shared [`<RouteErrorBoundary />`](../src/app/routing/RouteErrorBoundary.tsx)
   handles loader throws (incl. permission `Response`s with `status`)
   and uncaught render errors inside the route subtree, while
   preserving the app shell (header, nav, theme).

2. **Mutation/query `meta.errorMessage`** — the queryClient layer turns
   this into a toast automatically; never `try/catch` in components for
   the sole purpose of showing an error message.

3. **Feature-local `<TelemetryErrorBoundary>`** — only when a sub-tree
   should degrade independently (e.g. a side-panel widget failing should
   not take down the page). The platform already exports a class
   boundary that logs to telemetry; reuse it with a small fallback:

   ```tsx
   import { TelemetryErrorBoundary, useTelemetry } from '@/shared/platform/telemetry'
   import { EmptyState } from '@/shared/components/EmptyState'

   const WidgetFallback = () => <EmptyState title="Couldn't load widget" />

   export const SafeWidget = () => {
     const telemetry = useTelemetry()
     return (
       <TelemetryErrorBoundary telemetry={telemetry} fallback={WidgetFallback}>
         <Widget />
       </TelemetryErrorBoundary>
     )
   }
   ```

   Default to the route boundary; reach for a local one only when the
   degraded UX is clearly better than the route-level fallback.

## Tests

- Co-locate `.test.tsx` next to the component.
- Render through `<AppProviders>` with the real `QueryClient` and MSW
  handlers (see `src/mocks/`) — close to production behaviour.
- Split large suites by concern: `<Page>.mutations.test.tsx`,
  `<Page>.error.test.tsx`, `<Page>.toast.test.tsx`.
- Seed the user with `queryClient.setQueryData(userQuery().queryKey, …)`
  in `beforeEach` so permission-gated controls render.
- Prefer semantic queries (`getByRole`, `getByLabelText`) and
  behaviour assertions over snapshots.

## Feature flags

Two shapes are supported (see [config/featureFlags.ts](../src/config/featureFlags.ts)):

```ts
[FeatureFlagName.NEW_TODO_FORM]: ENV.isDev,                // boolean
[FeatureFlagName.BULK_TOOLS]:    [{ allowedRoles: ['admin'] }], // role-gated
```

Gate UI with `<FeatureToggle featureFlag={FeatureFlagName.X}>` or the
`useFeatureFlag(name)` hook.

## Checklist when adding a feature

- [ ] Folder layout matches above
- [ ] Barrel exports only the public surface (incl. `<Name>PageLazy`)
- [ ] Route uses `lazy` + eager loader in `app/routing/router.tsx`
- [ ] Query options factory used by both loader and component
- [ ] Mutations carry `meta: { invalidates, successMessage, errorMessage }`
- [ ] All invalidations go through `api/invalidations.ts`
- [ ] Forms reuse `zod.gen` schemas
- [ ] Loader enforces permissions; UI hides unavailable actions
- [ ] URL state lives in `*.hooks.ts`, not in component state
- [ ] Route `errorElement` set; feature-local `<TelemetryErrorBoundary>` only when justified
- [ ] Tests cover happy path, mutations, errors, toasts
