import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Telemetry } from '@/shared/platform/telemetry'

export interface ProvidersProps {
  telemetry: Telemetry
  queryClient: QueryClient
  children: ReactNode
}
