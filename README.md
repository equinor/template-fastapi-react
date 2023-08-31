<!-- markdownlint-configure-file {
  "MD013": {
    "code_blocks": false,
    "tables": false
  },
  "MD033": false,
  "MD041": false
} -->

<div align="center">

# Template Fastapi React

[![License][license-badge]][license]
[![On push main branch][on-push-main-branch-badge]][on-push-main-branch-action]

This is a **solution template** for creating a Single Page App (SPA) with React and FastAPI following the principles of Clean Architecture.

[Key Features](#key-features)•
[Quickstart](#quickstart) •
[Development](#development) •
[Contributing](#contributing)

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

In order to run the commands described below, you need:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Make sure you have Python installed. version 3.10 or higher is required.

### Configuration

Environment variables is used for configuration and must be set before running.

Create a copy of `.env-template` called `.env` and populate it with values.

- `XXX`: Specifies the directory in which the database is stored.

### Running

Once you have done the configuration, you can start running:

```sh
docker-compose up
```

The application will be served at http://localhost

The API documentation can be found at http://localhost:5000/docs

<a id="development"></a>
## :dizzy: Development

See the [docs](https://equinor.github.io/template-fastapi-react/) if you want to start developing.

<a id="Contributing"></a>
## :+1: Contributing

Thanks for your interest in contributing! There are many ways to contribute to this project. Get started [here](CONTRIBUTING.md).

[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license]: https://github.com/equinor/boilerplate-clean-architecture/blob/main/LICENSE
[releases]: https://github.com/equinor/boilerplate-clean-architecture/releases
[on-push-main-branch-badge]: https://github.com/equinor/boilerplate-clean-architecture/actions/workflows/on-push-main-branch.yaml/badge.svg
[on-push-main-branch-action]: https://github.com/equinor/boilerplate-clean-architecture/actions/workflows/on-push-main-branch.yaml