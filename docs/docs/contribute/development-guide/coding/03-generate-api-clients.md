# Generate API clients

To generate the typescript client for the API, run:

```shell
mise run generate:api-client-from-spec
```

This regenerates `api/.openapi.json`, installs the locked pnpm dependencies, and
uses `web/openapi-ts.config.ts` to populate `web/src/api-generated`. To regenerate
only the client from an existing spec, run `cd web && pnpm generate`.

The generator is pinned to `@hey-api/openapi-ts@0.97.3` with TypeScript 6 because
its JavaScript compiler API is unavailable in TypeScript 7 (the supported
`0.99.0` release still uses `ts.factory`). Vite+'s native type checker does not
replace this generator dependency. Commit generated changes, not manual edits.
