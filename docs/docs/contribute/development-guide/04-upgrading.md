# Upgrading

## Packages
!!! info "Info"

    Remember to restart!

    Any changes you make to these files will only come into effect after you restart the
    server. If you run the application using containers,
    you need to do `docker compose build` and then `docker compose up` to get the changes.

### API dependencies
First, change directory to the `/api` directory:

```shell
cd /api
```

To add a new dependency, use the following command. If you only want to add it to the `dev` dependency group, add the `--dev` option.
```shell
uv add <dependency> [--dev]
```

To remove a dependency, use the following command
```shell
uv remove <dependency>
```

To update your environment, run
```shell
uv sync --dev
```

### Web dependencies

```shell
cd web/
pnpm add <dependency>
pnpm remove <dependency>
pnpm install --frozen-lockfile
```

Commit `pnpm-lock.yaml` with manifest changes. The `vite` and `vite-plus` catalog
entries in `pnpm-workspace.yaml` must use the same Vite+ release; update the Vite
override and bundled Vitest override together. Dependabot uses the `npm` ecosystem
for `/web`, including pnpm catalogs.

Do not upgrade the project's `typescript` dependency to 7 until the OpenAPI
generator no longer requires `ts.factory`. Vite+ already provides independent
TypeScript 7-based checking via `vp check`. After upgrades, run `pnpm exec vp check`,
`pnpm test`, `pnpm build` and `pnpm generate`.
