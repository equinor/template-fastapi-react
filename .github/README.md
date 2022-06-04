<!-- markdownlint-configure-file {
  "MD013": {
    "code_blocks": false,
    "tables": false
  },
  "MD033": false,
  "MD041": false
} -->

<div align="center">

# Awesome Boilerplate

[![License][license-badge]][license]

This boilerplate is the **go-to** for getting starting with a smooth FastAPI REST API backend and React frontend.

[Key Features](#key-features) •
[Quickstart](#quickstart) •
[Development](#development) •
[Contributing](#contributing)

</div>

<a id="key-features"></a>
## :dart: Key features

* Clean architecture
* Auto-generate changelogs

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

```sh
docker-compose up
```

The web app will be served at http://localhost

<a id="development"></a>
## :dizzy: Development

See the [development](DEVELOPMENT.md) docs if you want to start developing.

<a id="Contributing"></a>
## :+1: Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license]: https://github.com/equinor/boilerplate-clean-architecture/blob/main/LICENSE.md
[releases]: https://github.com/equinor/boilerplate-clean-architecture/releases

