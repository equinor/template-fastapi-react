# Theme

This barrel re-exports Hermes' `initColorScheme` and `useColorScheme`.
Bootstrap calls `initColorScheme()` before rendering; Hermes' NavBar provides the
light/dark toggle. EDS tokens and Hermes CSS select colors through the
`data-color-scheme` attribute on `<html>`.

```tsx
const { colorScheme, toggleColorScheme } = useColorScheme()
return <button onClick={toggleColorScheme}>Current scheme: {colorScheme}</button>
```

Hermes 1.11.0 reads `localStorage['color-scheme']`, falling back to the OS
preference when no value is stored. OS changes are followed until an explicit
preference is saved. It has no way to return to System/auto from its binary
toggle ([upstream #94](https://github.com/equinor/team-hermes-packages/pull/94)).
Storage access is not guarded; blocked storage can fail bootstrap or toggling.
These gaps remain documented in the consumer tests rather than locally patched.
