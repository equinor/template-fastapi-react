import { Button, Typography } from '@equinor/eds-core-react'
import { ErrorPanel } from '@/shared/components/ErrorPanel'

/**
 * Outermost fallback rendered by TelemetryProvider's error boundary —
 * if this is showing, the provider stack itself failed (no router, no
 * theme, possibly no auth). The Tailwind stylesheet is loaded by
 * `index.tsx` *before* AppProviders mounts, so utility classes are safe
 * here even when React itself bails.
 */
export const ApplicationError = ({ error }: { error: Error }) => (
  <div className="max-w-[720px] mx-auto px-md py-xl flex flex-col gap-md">
    <Typography variant="h1">The application failed to load</Typography>
    <ErrorPanel error={error} />
    <div>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  </div>
)
