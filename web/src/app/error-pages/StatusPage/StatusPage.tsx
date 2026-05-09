import { Typography } from '@equinor/eds-core-react'
import type { StatusPageProps } from './StatusPage.types'

/**
 * Shared layout for app-shell status screens (404, 403, unexpected error).
 * Renders a centred card with title + body + optional action so all three
 * pages look like part of the same family. The card has its own surface
 * so it reads as a single bounded element regardless of what the route
 * body renders inside it.
 */
export const StatusPage = ({ title, body, action }: StatusPageProps) => (
  <section className="mx-auto flex max-w-[560px] flex-col items-center gap-lg rounded-card bg-surface px-lg py-xl text-center shadow-card">
    <Typography variant="h2" className="!m-0">
      {title}
    </Typography>
    {body && (
      <div className="w-full text-left">
        {typeof body === 'string' ? (
          <Typography variant="body_long" className="text-center">
            {body}
          </Typography>
        ) : (
          body
        )}
      </div>
    )}
    {action && <div className="pt-sm">{action}</div>}
  </section>
)
