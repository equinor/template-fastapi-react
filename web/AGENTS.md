# Web application guide

The web app uses React 19, TanStack Router/Query, pnpm and Vite+. Consume the
released `@team-hermes/react-components` package for shared UI, toast, theme and
telemetry; do not add local package forks or patches.

## Commands

Run these from the repository root:

```sh
mise run lint:web
mise run test:web
mise run build:web
```

`mise run lint:web` runs the TypeScript compile check and Vite+ checks. OpenAPI
generation is isolated under `openapi/`; regenerate the API client with
`mise run generate:api-client-from-spec`.

## Structure and imports

- `src/app/` owns bootstrap, providers, routes, layout and error pages.
- `src/config/` owns typed build-time configuration; read environment values
  only in `config/env.ts`.
- `src/features/<name>/` owns feature UI and API code. Other modules import
  features only through `@/features/<name>`.
- `src/shared/components/` and `src/shared/platform/<module>/` are reusable
  template code. Import platform modules through their public
  `@/shared/platform/<module>` barrels.
- `shared/` must not depend on `app/` or `features/`; features must not reach
  into another feature's internals. Oxlint enforces these boundaries.

## Generated files

Do not hand-edit `src/app/routeTree.gen.ts`; the TanStack Router Vite plugin
generates it from files in `src/app/routes/` during development and builds. Do
not hand-edit `src/api-generated/`; `mise run generate:api-client-from-spec`
regenerates it from the API OpenAPI schema. Commit generated output with its
source changes.

## API, auth and errors

Use the shared API platform and generated SDK. `configureApiClient` installs the
fetch funnel for tracing, timeouts, error normalization and 401 handling.
`ApiError` values carry trace IDs; HTTP failures emit `http.error` telemetry.
Use query/mutation metadata for notifications; mutations do not retry, queries
retry once except for 401/403/404, initial-load query errors stay in component
error state, and failed background refetches may notify. A 401 is handled by
`SessionExpiredDialog`, not a toast. Unexpected non-`ApiError` failures that
trigger a notification are reported as exceptions.

Authentication is handled by oauth2-proxy and the BFF with an HttpOnly session
cookie. Do not put bearer tokens in browser code or set SDK auth headers.
`src/index.tsx` owns the root telemetry error boundary, global error-handler
registration and session-watcher lifecycle; preserve their cleanup on unmount
and HMR.
