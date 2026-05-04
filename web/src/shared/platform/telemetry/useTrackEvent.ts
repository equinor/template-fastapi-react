import { useCallback, useEffect, useRef } from 'react'
import { useTelemetry } from './TelemetryContext'

// Returns a stable callback that emits a custom event through whichever
// telemetry backend is active. Mirrors the ergonomics of
// `@microsoft/applicationinsights-react-js`'s `useTrackEvent` but goes
// through the abstract `Telemetry`, so the `console` and `noop`
// backends work too — useful in dev and tests.
//
// `baseProps` are merged with the per-call `extraProps`; per-call wins.
export const useTrackEvent = <P extends Record<string, unknown>>(name: string, baseProps?: P) => {
  const telemetry = useTelemetry()
  // Snapshot baseProps in a ref so the returned callback stays stable
  // even if the caller passes a fresh object literal each render.
  const baseRef = useRef(baseProps)
  baseRef.current = baseProps
  return useCallback(
    (extraProps?: Record<string, unknown>) => {
      telemetry.trackEvent(name, { ...baseRef.current, ...extraProps })
    },
    [telemetry, name]
  )
}

// Fires `name` once when the component mounts. Use for "this view was
// opened" / "this dialog rendered" style events.
export const useTrackMount = (name: string, props?: Record<string, unknown>) => {
  const telemetry = useTelemetry()
  const propsRef = useRef(props)
  propsRef.current = props
  useEffect(() => {
    telemetry.trackEvent(name, propsRef.current)
  }, [telemetry, name])
}
