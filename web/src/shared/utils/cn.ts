import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Compose Tailwind class names. `clsx` handles conditionals and arrays;
 * `twMerge` resolves conflicts (later token wins, e.g. `p-2 p-4` → `p-4`).
 *
 * Use whenever you'd otherwise write `${base} ${variant ? 'foo' : 'bar'}`.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
