import { Button, Typography } from '@equinor/eds-core-react'
import { ErrorPanel } from '@/shared/components/ErrorPanel/ErrorPanel'

// Outermost fallback rendered by TelemetryProvider's error boundary —
// if this is showing, the provider stack itself failed (no router, no
// theme, possibly no auth). The Tailwind stylesheet is loaded by
// `index.tsx` *before* AppProviders mounts, so utility classes are safe
// here even when React itself bails. Accepts `unknown` so it can also
// be used directly from the bootstrap try/catch in `index.tsx`.
export const ApplicationError = ({ error }: { error: unknown }) => {
  const normalised = error instanceof Error ? error : new Error(String(error))
  return (
    <div className="max-w-[720px] mx-auto px-md py-xl flex flex-col gap-md">
      <Typography variant="h1">The application failed to load</Typography>
      <ErrorPanel error={normalised} />
      <div>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    </div>
  )
}
