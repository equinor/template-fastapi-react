// Outermost error boundary: logs once via injected telemetry, then renders
// `fallback` so users see more than a blank screen.

import { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react'
import type { Telemetry } from './types'

type Props = {
  telemetry: Telemetry
  children: ReactNode
  fallback: ComponentType<{ error: Error }>
}

type State = { error: Error | null }

export class TelemetryErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.telemetry.trackException(error, { componentStack: info.componentStack })
  }

  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback
      return <Fallback error={this.state.error} />
    }
    return this.props.children
  }
}
