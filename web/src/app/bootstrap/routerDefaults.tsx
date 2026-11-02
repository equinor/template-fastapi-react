import { RouteErrorBoundary } from '@/app/error-pages/RouteErrorBoundary/RouteErrorBoundary'
import { LoadingState } from '@/shared/components/LoadingState/LoadingState'

/**
 * Router-wide defaults passed to `createRouter` in `index.tsx`. Kept in
 * their own module so the routing tests can build a router with the same
 * defaults.
 */
export const routerDefaults = {
  defaultPreload: 'intent',
  // Shown while a route's `loader`/`beforeLoad` is pending. Without
  // this, TanStack Router renders nothing, which flashes a blank
  // screen on cold navigations.
  defaultPendingComponent: () => <LoadingState variant="fullscreen" label="Loading…" />,
  // Gives every route its own error boundary. Without it, a leaf route's
  // error bubbles up to the root route's `errorComponent`, which replaces
  // the whole layout (header included) with the error page.
  defaultErrorComponent: RouteErrorBoundary,
} as const
