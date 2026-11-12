# Getting Started with TypeScript React

The web application uses [Vite+](https://viteplus.dev/) with pnpm and Node 24.22.2.
Run `mise install` from the repository root, then `mise run install-dependencies:web`.
All `vp` commands below use the pinned local dependency, not a global Vite+ install.

- TypeScript React
- Formatting and linting with Oxfmt/Oxlint, including TanStack Query and import boundaries
- Testing with Vite+'s Vitest 5 and Testing Library
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
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
└─ vite.config.ts
```

Of note:

- `tsconfig.json` references `tsconfig.app.json` (source and tests) and
  `tsconfig.node.json` (root tool configuration files). Run `pnpm compile`
  (`tsc -b`) to check both; `pnpm build` runs `vp check` before building.
  The app config owns the `@/*` alias without `baseUrl`.
- `vite.config.ts` owns lint, format, test and build configuration. TanStack Query's
  six supported recommended rules run through Oxlint's JS-plugin support;
  import-boundary overrides preserve feature and platform barrels and shared/config
  layering. `no-void-query-fn` is not enabled: it needs ESLint parser services
  unavailable in this bridge and was also inert in the previous untyped ESLint config.
- `pnpm-workspace.yaml` pins Vite+ and its Vite core alias together in the catalog.
  Keep the Vite override and bundled Vitest override aligned when upgrading Vite+.
- `package.json` contains dependencies, as well as some shortcuts for commands we'd like to run for testing, previewing, and deploying the app.
- `public` contains static assets, including the unauthenticated `signed-out.html` landing page. Keep that page when customizing the app.
- `src` contains the code. `index.tsx` is the entry-point for your file, and is mandatory.

To learn React, check out the [React documentation](https://reactjs.org/).

The web application uses TypeScript 7. OpenAPI generation has its own package
and lockfile under `openapi/`, so its generator dependencies do not affect the
web toolchain. The configs use erasable syntax, verbatim module syntax, and
forced module detection.

## Web commands

Run these from `web/` after `pnpm install --frozen-lockfile`:

| Command              | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `pnpm start`         | Dev server on port 3000                            |
| `pnpm exec vp check` | Formatting, lint and native TypeScript checks      |
| `pnpm compile`       | Check app and tooling projects with TypeScript 7   |
| `pnpm exec vp fmt`   | Format web source, CSS/Tailwind, JSON and Markdown |
| `pnpm test`          | Run all colocated tests once (CI-safe)             |
| `pnpm test:watch`    | Watch tests locally                                |
| `pnpm build`         | Check and build production assets into `build/`    |

CI runs the same checks, tests and production build through mise. The existing
pre-commit policy uses the local Vite+ dependency and translates repository-root
changed-file paths into web-relative paths. Install dependencies before committing.

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
