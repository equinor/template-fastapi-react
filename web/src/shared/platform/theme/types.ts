// Public types for the theme platform module.

// Color-scheme preference. `auto` follows the OS via the
// `:root { color-scheme: light dark }` fallback in CSS.
export type ColorScheme = 'light' | 'dark' | 'auto'
