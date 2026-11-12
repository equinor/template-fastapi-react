# Generate API clients

```shell
mise run generate:api-client-from-spec
```

This regenerates `api/.openapi.json`, installs the isolated generator dependencies,
and uses `openapi/openapi-ts.config.ts` to populate `web/src/api-generated`. To
regenerate only the client from an existing spec, run
`mise run generate:api-client`.

The generator and its lockfile are isolated in `openapi/`, so they do not
constrain the web application's TypeScript version. Commit generated changes,
not manual edits.

The generator still uses the TypeScript 6 JavaScript compiler API. Dependabot
ignores TypeScript major updates in this package until the generator supports
TypeScript 7; this does not restrict TypeScript updates in `web/`.
