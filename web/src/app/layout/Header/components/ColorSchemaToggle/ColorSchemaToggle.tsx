import { Icon, Popover } from '@equinor/eds-core-react'
import { close, type IconData, light, lightbulb, settings } from '@equinor/eds-icons'
import { useId, useRef, useState } from 'react'
import { IconButton } from '@/shared/components/IconButton/IconButton'
import type { ColorScheme } from '@/shared/platform/theme'
import { useColorScheme } from '@/shared/platform/theme'
import './ColorSchemaToggle.css'

const SCHEME_OPTIONS: { value: ColorScheme; label: string; icon: IconData }[] = [
  { value: 'auto', label: 'System', icon: settings },
  { value: 'light', label: 'Light', icon: light },
  { value: 'dark', label: 'Dark', icon: lightbulb },
]

export function ColorSchemaToggle() {
  const [scheme, setScheme] = useColorScheme()
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const themeRef = useRef<HTMLButtonElement>(null)
  const popoverId = useId()

  return (
    <>
      <IconButton
        aria-label="Color scheme"
        title="Color scheme"
        icon={light}
        onClick={() => setIsThemeOpen(!isThemeOpen)}
        ref={themeRef}
        aria-haspopup="true"
        aria-controls={isThemeOpen ? popoverId : undefined}
        aria-expanded={isThemeOpen}
      />
      <Popover id={popoverId} open={isThemeOpen} onClose={() => setIsThemeOpen(false)} anchorEl={themeRef.current}>
        <Popover.Header>
          <Popover.Title>Color scheme</Popover.Title>
          <IconButton
            aria-label="Close Color Scheme Popover"
            title="Close"
            icon={close}
            onClick={() => setIsThemeOpen(false)}
          />
        </Popover.Header>
        <div className="flex gap-2 p-2 min-w-[360px]" role="radiogroup" aria-label="Color scheme options">
          {SCHEME_OPTIONS.map(({ value, label, icon }) => (
            <label key={value} className="color-schema-radio" data-selected={scheme === value}>
              <input
                type="radio"
                name="color-scheme"
                key={value}
                onClick={() => setScheme(value)}
                aria-checked={scheme === value}
                className="sr-only"
              />
              <Icon data={icon} size={18} />
              {label}
            </label>
          ))}
        </div>
      </Popover>
    </>
  )
}
