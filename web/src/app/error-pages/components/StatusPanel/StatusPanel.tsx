import { Button, Icon } from '@equinor/eds-core-react'
import { arrow_back } from '@equinor/eds-icons'
import { createLink } from '@tanstack/react-router'

const ButtonLink = createLink(Button)

export interface StatusPanelProps {
  errorCode?: string | number
  title: string
  body?: React.ReactNode
}

/**
 * Shared layout for app-shell status screens (404, 403, unexpected error).
 */
export const StatusPanel = ({ errorCode, title, body }: StatusPanelProps) => (
  <section className="mx-auto flex max-w-[720px] flex-col items-center gap-lg p-8 text-center">
    {errorCode && <h1 className="text-7xl font-bold">{errorCode}</h1>}
    <h2 className="text-3xl font-semibold">{title}</h2>
    {body && <div className="w-full">{typeof body === 'string' ? <p className="text-center">{body}</p> : body}</div>}
    <ButtonLink to="/">
      <Icon data={arrow_back} />
      <span>GO HOME</span>
    </ButtonLink>
  </section>
)
