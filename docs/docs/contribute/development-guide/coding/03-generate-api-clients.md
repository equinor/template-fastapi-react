# Generate API clients

To generate the typescript client for the API, run:

```shell
cd web
yarn generate
```

This uses the configuration in `web/openapi-ts.config.ts` and populates `web/src/api/generated` with new typescript files that match the API's OpenAPI specification.
