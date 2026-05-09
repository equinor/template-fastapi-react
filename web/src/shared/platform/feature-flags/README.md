# Feature flags

Generic, role-aware feature flag plumbing. The platform module is
agnostic of the app's user shape: it consumes any subject that has a
`roles: readonly string[]` field. Apps own the flag enum and the table.

## Files

| File | Purpose |
|---|---|
| `FeatureFlagsContext.tsx` | Provider, context, types, `isEnabled` evaluator. |
| `useFeatureFlag.ts` | Hook returning a `boolean` for a flag. Handles dev-only `localStorage` override. |
| `FeatureToggle.tsx` | JSX gate — `<FeatureToggle featureFlag={…}>{children}</FeatureToggle>`. |
| `index.ts` | Public barrel (deep imports blocked by ESLint). |

## Wiring

The provider is mounted from the root route once the user has resolved,
so all flag reads see a populated subject.

```tsx
// app/routes/__root.tsx
const { data: user } = useCurrentUser()
return (
  <FeatureFlagsProvider flags={FEATURE_FLAGS} user={user}>
    <Outlet />
  </FeatureFlagsProvider>
)
```

The flag table lives in app config:

```ts
// config/featureFlags.ts
export enum FeatureFlagName {
  NEW_TODO_FORM = 'NEW_TODO_FORM',
  BULK_TOOLS = 'BULK_TOOLS',
}

export const FEATURE_FLAGS: FeatureFlagsTable<FeatureFlagName> = {
  [FeatureFlagName.NEW_TODO_FORM]: ENV.isDev,                 // boolean
  [FeatureFlagName.BULK_TOOLS]: [{ allowedRoles: ['admin'] }], // role-gated
}
```

## Usage

```tsx
// JSX gate
<FeatureToggle featureFlag={FeatureFlagName.BULK_TOOLS}>
  <BulkActions />
</FeatureToggle>

// Boolean in handlers / conditionals
const showBulk = useFeatureFlag(FeatureFlagName.BULK_TOOLS)
```

For non-React code (loaders, plain modules) call `isEnabled` directly:

```ts
isEnabled(FeatureFlagName.BULK_TOOLS, user.roles, FEATURE_FLAGS)
```

## Rule shapes

- `true` / `false` — hard on/off.
- `[{ allowedRoles: ['admin', 'editor'] }]` — on if the subject has any
  listed role.
- `[{}]` — unconditional (rule with no roles always matches).
- Multiple rule entries are OR-ed.

## Dev-only override

In development, `useFeatureFlag` checks `localStorage` first:

```js
localStorage.setItem('flag:BULK_TOOLS', '1'); location.reload()  // force on
localStorage.setItem('flag:BULK_TOOLS', '0'); location.reload()  // force off
localStorage.removeItem('flag:BULK_TOOLS');   location.reload()  // back to configured
```

The override branch is dead code in production builds
(`import.meta.env.DEV` is statically `false`).

## Adding a flag

1. Append to `FeatureFlagName` in `config/featureFlags.ts`.
2. Add a row to `FEATURE_FLAGS` (boolean or rule array).
3. Reference via `<FeatureToggle>` or `useFeatureFlag()`.

## Adding a new rule kind

Today the only rule field is `allowedRoles`. To gate on user id, tenant,
etc.:

1. Widen `FeatureFlagsSubject` (e.g. add `id: string`).
2. Add the new field to `FeatureFlagRule` (e.g. `allowedUserIds`).
3. Extend `isEnabled` to test it.

`FeatureFlagsProvider` is generic in the subject (`U extends
FeatureFlagsSubject`), so callers can keep passing their full user.

## Testing

The provider takes `user` directly, so tests can pass any subject
without mocking auth:

```tsx
<FeatureFlagsProvider flags={{ DEMO: true }} user={{ roles: ['admin'] }}>
  <FeatureToggle featureFlag="DEMO">…</FeatureToggle>
</FeatureFlagsProvider>
```
