/**
 * Outermost provider — error boundary that catches everything React throws
 * during render or commit. Logs once via telemetry, then renders the
 * `<ApplicationError />` fallback so users get more than a blank screen.
 */

import { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react'
import { telemetry } from './telemetry'

type Props = {
  children: ReactNode
  fallback: ComponentType<{ error: Error }>
}

type State = { error: Error | null }

class TelemetryErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    telemetry.trackException(error, { componentStack: info.componentStack })
  }

  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback
      return <Fallback error={this.state.error} />
    }
    return this.props.children
  }
}

export const TelemetryProvider = ({ children, fallback }: Props) => (
  <TelemetryErrorBoundary fallback={fallback}>{children}</TelemetryErrorBoundary>
)
