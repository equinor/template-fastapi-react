import { Button, Icon } from '@equinor/eds-core-react'
import { arrow_forward } from '@equinor/eds-icons'
import { createLink } from '@tanstack/react-router'
import { PageHeader } from '@/shared/components/PageHeader/PageHeader'

const PageLink = createLink(Button)

export const HomePage = () => {
  return (
    <div className="flex flex-col items-start gap-lg">
      <PageHeader title="Welcome" />
      <p>Template FastAPI + React is running.</p>
      <PageLink to="/todos" variant="ghost">
        My Todos
        <Icon data={arrow_forward} />
      </PageLink>
    </div>
  )
}
