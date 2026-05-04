import { GoHomeButton, StatusPage } from './StatusPage'

export const NotFoundPage = () => (
  <StatusPage title="404 — not found" body="That page doesn't exist." action={<GoHomeButton />} />
)
