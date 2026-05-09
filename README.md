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

### Prerequisites

The minimum requirements to run the application locally are:

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Configuration

Environment variables is used for configuration and must be set before running.

Create a copy of `.env-template` called `.env` and populate it with values:

- `XYZ`: Specifies the [RESOURCE NAME] connection string

**Note:** The template doesn't have any values that you need to replace, but any instantiated project probably will.

### Backend-for-Frontend (BFF) auth

User authentication is terminated at the edge by [oauth2-proxy](https://oauth2-proxy.github.io/oauth2-proxy/),
which sets an HttpOnly session cookie and forwards a bearer token to the
FastAPI service. Browser → `nginx :80` → `oauth2-proxy` → `nginx` → `api`.

Two Entra ID app registrations are required per environment: one for the
**API** (resource server) and one for **oauth2-proxy** (OIDC client). They
are provisioned by [`IaC/app-registration.bicep`](IaC/app-registration.bicep),
wrapped by [`IaC/deploy-app-registration.sh`](IaC/deploy-app-registration.sh).
For each environment:

For each environment, run:

```sh
./IaC/deploy-app-registration.sh
```

The script prompts for `APPLICATION_NAME`, `ENVIRONMENT`, `OWNERS_GROUP`
(default `Team Hermes Radix Admin`), and an optional
`SERVICE_MANAGEMENT_REFERENCE`. Set any of these as environment variables
beforehand to skip the prompt. Owners are taken from the members of the
named Entra group.

The script deploys both registrations, prints `apiApplicationId`,
`apiScope`, `oauth2ApplicationId`, and writes a fresh BFF client secret
to `secrets/OAUTH2_CLIENT_SECRET.txt`.

Map the deployment outputs into local config:

- `OAUTH_CLIENT_ID` ← `oauth2ApplicationId`
- `OAUTH_AUDIENCE` ← `apiApplicationId`
- `OAUTH_AUTH_SCOPE` ← `apiScope` (`api://<apiAppId>/access`)

Also create the other secrets listed in [`secrets/README.md`](secrets/README.md):
`OAUTH2_PROXY_COOKIE_SECRET.txt` and `REDIS_PASSWORD.txt`. The dev redirect
URI (`http://localhost/oauth2/callback`) is already registered by the Bicep
deployment.

### Running

Once you have done the configuration, you can start running:

```sh
docker compose up --build
```

The application will be served at http://localhost

The API documentation can be found at http://localhost:5000/docs

<a id="development"></a>
## :dizzy: Development

See the [docs](https://equinor.github.io/template-fastapi-react/) if you want to start developing.

Or run the docs locally:

```sh
mise run docs-serve
```

<a id="contributing"></a>
## :+1: Contributing

Thanks for your interest in contributing! There are many ways to contribute to this project. Get started [here](CONTRIBUTING.md).

[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license]: https://github.com/equinor/boilerplate-clean-architecture/blob/main/LICENSE
[releases]: https://github.com/equinor/boilerplate-clean-architecture/releases
[on-push-main-branch-badge]: https://github.com/equinor/boilerplate-clean-architecture/actions/workflows/on-push-main-branch.yaml/badge.svg
[on-push-main-branch-action]: https://github.com/equinor/boilerplate-clean-architecture/actions/workflows/on-push-main-branch.yaml
