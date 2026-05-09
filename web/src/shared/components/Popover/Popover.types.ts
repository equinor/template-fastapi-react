import type { ReactNode } from 'react'

export interface PopoverProps {
  children: ReactNode
  title: string
  toggle: () => void
  isOpen: boolean
  anchor?: HTMLElement | null
}
