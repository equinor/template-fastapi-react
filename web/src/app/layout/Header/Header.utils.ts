import { light, lightbulb, sun } from '@equinor/eds-icons'
import type { ColorScheme } from '@/shared/platform/theme'

// Cycle: auto → light → dark → auto. Tooltip shows the *next* state so
// the click outcome is predictable.
export const NEXT: Record<ColorScheme, ColorScheme> = { auto: 'light', light: 'dark', dark: 'auto' }
export const ICON: Record<ColorScheme, typeof sun> = { auto: light, light: sun, dark: lightbulb }
export const TITLE: Record<ColorScheme, string> = {
  auto: 'Theme: follow system — switch to light',
  light: 'Theme: light — switch to dark',
  dark: 'Theme: dark — follow system',
}
