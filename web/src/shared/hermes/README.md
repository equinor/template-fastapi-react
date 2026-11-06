# Hermes consumer contracts

These tests cover the released package as consumed by the template, including
API error guards, ErrorPanel rendering and theme behavior. They import Hermes
directly; no local component or platform re-export is needed. Keep the
expected-failure and todo trackers until the corresponding upstream fixes ship.

## Theme

Import `initColorScheme` and `useColorScheme` from `@team-hermes/react-components`.
Bootstrap calls `initColorScheme()` before rendering; Hermes' NavBar provides the
light/dark toggle. EDS tokens and Hermes CSS select colors through the
`data-color-scheme` attribute on `<html>`.

```tsx
import { useColorScheme } from '@team-hermes/react-components'

const { colorScheme, toggleColorScheme } = useColorScheme()
return <button onClick={toggleColorScheme}>Current scheme: {colorScheme}</button>
```

Hermes 1.11.0 reads `localStorage['color-scheme']`, falling back to the OS
preference when no value is stored. OS changes are followed until an explicit
preference is saved. It has no way to return to System/auto from its binary
toggle ([upstream #94](https://github.com/equinor/team-hermes-packages/pull/94)).
Storage access is not guarded; blocked storage can fail bootstrap or toggling.
These gaps remain documented in the consumer tests rather than locally patched.
