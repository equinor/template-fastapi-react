import { Button } from '@equinor/eds-core-react'
import { Link } from '@tanstack/react-router'

/** Convenience for the most common action: "go home". */
export const GoHomeButton = () => (
  <Link to="/" className="no-underline">
    <Button variant="outlined">Go home</Button>
  </Link>
)
