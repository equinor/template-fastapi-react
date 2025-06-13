# Upgrading

## Packages
:::info

Remember to restart!

Any changes you make to these files will only come into effect after you restart the
server. If you run the application using containers,
you need to do `docker compose build` and then `docker compose up` to get the changes.

:::

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
# Add or remove package to package.json
yarn install
```
