import { useId } from 'react'
import { cn } from '@/shared/utils/cn'
import type { TodosFilterProps } from './TodosFilter.types'
import { OPTIONS } from './TodosFilter.utils'

/**
 * Segmented control for status filter. Built on real `<input type="radio">`
 * elements so we get keyboard arrow navigation, form semantics, and screen
 * reader announcements for free — the visible buttons are just styled
 * `<label>`s peering into the input's `:checked` state.
 *
 * URL state lives one level up in `TodosPage` (via `nuqs`); this component
 * just renders the control and reports user choices.
 */
export const TodosFilter = ({ value, onChange }: TodosFilterProps) => {
  // `useId` keeps multiple instances on the same page from colliding.
  const groupId = useId()
  return (
    <fieldset className="inline-flex items-center gap-1 p-1 rounded-pill border border-border bg-canvas">
      {/* sr-only legend gives older AT a proper group name; sighted users
       *  see only the segmented buttons. */}
      <legend className="sr-only">Filter</legend>
      {OPTIONS.map((opt) => {
        const id = `${groupId}-${opt.value}`
        const isChecked = value === opt.value
        return (
          <span key={opt.value} className="contents">
            <input
              id={id}
              type="radio"
              name={groupId}
              value={opt.value}
              checked={isChecked}
              onChange={() => onChange(opt.value)}
              className="sr-only peer"
            />
            <label
              htmlFor={id}
              className={cn(
                'cursor-pointer select-none px-md py-xs rounded-pill text-sm font-medium',
                'transition-colors',
                isChecked ? 'bg-accent text-on-accent shadow-sm' : 'text-muted hover:text-strong hover:bg-hover'
              )}
            >
              {opt.label}
            </label>
          </span>
        )
      })}
    </fieldset>
  )
}
