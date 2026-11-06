# Getting Started with TypeScript React

This project was set up with [Create React App](https://github.com/facebook/create-react-app), but then ported to use [Vite](https://vitejs.dev/), which is faster and more actively maintained.

- TypeScript React
- Formatting and linting with Biome, with ESLint for TanStack Query and import boundaries
- Testing with Vitest and Testing Library
- State management with React Context

## TypeScript React

The starter project layout should look like the following:

```text
web/
├─ public/
├─ src/
│  └─ ...
├─ package.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
└─ eslint.config.mts
```

Of note:

- `tsconfig.json` references `tsconfig.app.json` (source and tests) and
  `tsconfig.node.json` (root tool configuration files). Run `yarn compile`
  (`tsc -b`) to check both; `yarn build` checks both before building with Vite.
  The app config owns the `@/*` alias without `baseUrl`.
- `eslint.config.mts` stores the TanStack Query and import-boundary rules.
- `package.json` contains dependencies, as well as some shortcuts for commands we'd like to run for testing, previewing, and deploying the app.
- `public` contains static assets, including the unauthenticated `signed-out.html` landing page. Keep that page when customizing the app.
- `src` contains the code. `index.tsx` is the entry-point for your file, and is mandatory.

To learn React, check out the [React documentation](https://reactjs.org/).

TypeScript stays on `~6.0.3` until OpenAPI generator compatibility is resolved.
`@hey-api/openapi-ts` uses the legacy `ts.factory` API, which is absent in
TypeScript 7.
The configs use erasable syntax, verbatim module syntax, and forced module
detection in preparation for that migration.

Query and router devtools load lazily in development only and are excluded
from production builds.

## Sign-out

Sign-out clears the oauth2-proxy session and redirects to `/signed-out.html`.
Nginx serves that public page without authentication, even without the Vite dev
server. It does not end the user's Entra SSO session; signing in again requires
clicking the page's link. Keep `public/signed-out.html` in the image.

## BFF development and deployment

The standalone Vite server forwards `/api` requests unchanged to the Docker
Compose nginx on port 80. Nginx strips `/api/` before proxying to FastAPI.

Production builds do not emit source maps. Enable them only after CI can upload
them privately and remove them from the public static-hosting artifact.
