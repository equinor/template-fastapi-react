import { GoHomeButton } from '../GoHomeButton/GoHomeButton'
import { StatusPage } from '../StatusPage/StatusPage'

export const ForbiddenPage = () => (
  <StatusPage title="403 — forbidden" body="You don't have permission to view this page." action={<GoHomeButton />} />
)
