<div align="center">

# Template Fastapi React

[![License][license-badge]][license]
[![On push main branch][on-push-main-branch-badge]][on-push-main-branch-action]

This is a **solution template** for creating a Single Page App (SPA) with React and FastAPI following the principles of Clean Architecture.

[Key Features](#key-features) • [Quickstart](#quickstart) • [Development](#development) • [Contributing](#contributing)

<!--- The demo project is not currently deployed.
A demo is running at https://template-fastapi-react.app.playground.radix.equinor.com
-->

</div>


<a id="key-features"></a>
## :dart: Key features

- Clean architecture
- Screaming architecture
- Auto-generated changelogs
- Auto-generated OpenAPI specification
- Automatic documentation of REST API
- Auto-generated REST API clients
- Pre-commit hooks
- Pydantic data validation

<a id="quickstart"></a>
## :zap: Quickstart

Prerequisites: [Docker](https://www.docker.com/) and Docker Compose.

The service images build `FROM dhi.io/...` ([Docker Hardened Images](https://docs.docker.com/dhi/)). These images are free but the `dhi.io` registry requires authentication, so a one-time `docker login` is needed before the first build (otherwise the build fails with an opaque `unauthorized` error):

```sh
docker login dhi.io   # one-time; free Docker Hub account works
docker compose -f docker-compose.yml -f docker-compose.no-auth.yml up --build
```

- App: http://localhost
- API docs: http://localhost:5000/docs

This brings up the stack **without** Entra ID / oauth2-proxy: the SPA loads,
calls the API directly, and sees the built-in `nologin` user. Useful for
bare-fork local development — no app registrations, no `secrets/*.txt`, no
`.env` required.

To run **with** authentication enabled (the production-equivalent flow), see
[Authentication & Azure setup](#lock-authentication--azure-setup) — fill in
`.env` from `.env-template`, populate `secrets/`, then:

```sh
cp .env-template .env
docker compose up --build
```

## :lock: Authentication & Azure setup

[oauth2-proxy](https://oauth2-proxy.github.io/oauth2-proxy/) sits in front of the API and forwards a bearer token to FastAPI for JWT validation. Flow: `browser → nginx :80 → oauth2-proxy → nginx → api`.

Each environment needs two Entra ID app registrations (API + oauth2-proxy), provisioned by [IaC/app-registration.bicep](IaC/app-registration.bicep). Requires the `Application Developer` directory role (activate via PIM):

```sh
mise run iac:appreg <env>            # dev | test | prod
mise run iac:appreg <env> --dry-run  # what-if only
mise run iac:appreg <env> --rotate   # redeploy + new BFF client secret
```

Rotate only the oauth2-proxy client secret (needs app-owner only, not `Application Developer`):

```sh
mise run iac:rotate-secret <env>
```

Azure resources (Postgres, Key Vault, App Insights, alerts) deploy separately:

```sh
mise run iac:infra <env>
```

Before deploying, edit the `[env]` section in [.mise/config.toml](.mise/config.toml) and replace every `<REPLACE_ME>` placeholder:

- `APPLICATION_NAME`
- `APP_OWNERS_GROUP`
- `SERVICE_MANAGEMENT_REFERENCE`
- `AZURE_SUBSCRIPTION`
- `ALERT_EMAIL_RECIPIENTS`

After deployment, copy the Bicep outputs into your `.env`:

| `.env` var         | Bicep output          |
| ------------------ | --------------------- |
| `OAUTH_CLIENT_ID`  | `oauth2ApplicationId` |
| `OAUTH_AUDIENCE`   | `apiApplicationId`    |
| `OAUTH_AUTH_SCOPE` | `apiScope`            |

Additional secrets are documented in [secrets/README.md](secrets/README.md).

## :dizzy: Development

See the [docs](https://equinor.github.io/template-fastapi-react/) or run locally:

```sh
mise run docs-serve
```

## :+1: Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license]: https://github.com/equinor/boilerplate-clean-architecture/blob/main/LICENSE
[on-push-main-branch-badge]: https://github.com/equinor/boilerplate-clean-architecture/actions/workflows/on-push-main-branch.yaml/badge.svg
[on-push-main-branch-action]: https://github.com/equinor/boilerplate-clean-architecture/actions/workflows/on-push-main-branch.yaml
