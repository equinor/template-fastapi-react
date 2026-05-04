import { CircularProgress } from '@equinor/eds-core-react'
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Header } from '@/app/layout/Header'

/**
 * Persistent frame around every route. Header + main outlet. The router's
 * `errorElement` (RouteErrorBoundary) renders inside the outlet, so the
 * header stays visible when a route fails. The `<Suspense>` boundary
 * catches `useSuspenseQuery` calls inside child routes — usually a no-op
 * because the loader has already primed the cache, but a safety net for
 * code-split chunks and any non-loader-primed query.
 */
const RouteFallback = () => (
  <div role="status" aria-label="Loading" className="flex justify-center py-xl">
    <CircularProgress />
  </div>
)

export const RootLayout = () => (
  <>
    <Header />
    <main className="max-w-[720px] mx-auto px-md py-xl">
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </main>
  </>
)
