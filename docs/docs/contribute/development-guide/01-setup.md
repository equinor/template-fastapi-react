# Setup

## Prerequisites

To work with the template monorepo you'll need to install [these tools](../../about/running/01-prerequisites.md).

## Pre-commit

When contributing to this project, pre-commits are necessary, as they run certain tests, sanitisers, and formatters.

The project provides a `.pre-commit-config.yaml` file that is used to setup git _pre-commit hooks_.

On commit locally, code is automatically formatted and checked for security vulnerabilities using pre-commit git hooks.

### Installation

To initialize pre-commit in your local repository, run

```shell
pre-commit install
```

This tells pre-commit to run for this repository on every commit.

### Usage

Pre-commit will run on every commit, but can also be run manually on all files:

```shell
pre-commit run --all-files
```

Pre-commit tests can be skipped on commits with `git commit --no-verify`.

!!! caution "Caution"
    If you have to skip the pre-commit tests, you're probably doing something you're not supposed to, and whoever commits after you might have to fix your "mistakes". Consider updating the pre-commit hooks if your code is non-compliant.

### Hooks
<details>

<summary>Overview</summary>

| Repository                                                                          | Hook                    | Purpose                                                                            |
|-------------------------------------------------------------------------------------|-------------------------|------------------------------------------------------------------------------------|
| [pre-commit/pre-commit-hooks](https://github.com/pre-commit/pre-commit-hooks)                                      | check-ast               | Check whether files parse as valid python                                          |
|                                                                                     | check-merge-conflict    | Check for files that contain merge conflict strings                                |
|                                                                                     | check-case-conflict     | Check for files with names that would conflict on a case-insensitive filesystem    |
|                                                                                     | check-json              | Verify syntax of all JSON files                                                    |
|                                                                                     | check-toml              | Verify syntax of all TOML files                                                    |
|                                                                                     | check-yaml              | Verify syntax of all YAML files                                                    |
|                                                                                     | trailing-whitespace     | Trim trailing whitespace                                                           |
|                                                                                     | mixed-line-ending       | Replaces or checks mixed line ending                                               |
|                                                                                     | detect-private-key      | Checks for the existence of private keys                                           |
| [compilerla/conventional-pre-commit](https://github.com/compilerla/conventional-pre-commit)                               | conventional-pre-commit | A pre-commit hook to check commit messages for Conventional Commits formatting     |
| [ambv/black](https://github.com/ambv/black)                                                       | black                   | Python code formatter                                                              |
| [PyCQA/bandit](https://github.com/PyCQA/bandit)                                                     | bandit                  | A security linter designed to find common security issues in Python code           |
| [econchick/interrogate](https://github.com/econchick/interrogate)                                            | interrogate             | Check the code base for missing docstrings                                         |
| [hadialqattan/pycln](https://github.com/hadialqattan/pycln)                                               | pycln                   | Finds and removes unused import statements                                         |
| [pycqa/isort](https://github.com/pycqa/isort)                                                      | isort                   | Sort imports alphabetically, and automatically separated into sections and by type |
| [local](https://github.com/equinor/template-fastapi-react/blob/main/.pre-commit-config.yaml) | vite-plus-check | Vite+ formatting, lint, import boundaries, TanStack Query rules and type checks |
| [pycqa/flake8](https://gitlab.com/pycqa/flake8)                                                     | flake8                  | Check the style and quality of Python code                                         |
| [local](https://github.com/equinor/template-fastapi-react/blob/main/.pre-commit-config.yaml) | mypy                    | Python type checker                                                                |
|                                                                                     | pytest                  | Python test runner                                                                 |
|                                                                                     |                         |                                                                                    |

</details>

## API

From inside the `/api` folder.

### Install `uv`

[`uv`](https://docs.astral.sh/uv/) is used to manage Python package dependencies.

```shell
$ pip install uv
```

The installation instructions can be found [here](https://docs.astral.sh/uv/getting-started/installation/).

### Install packages

```shell
$ uv sync --dev
```

## Web

From inside the /web folder.

### Package management

This project uses **pnpm** and **Vite+**, pinned in `web/package.json` and
`web/pnpm-workspace.yaml`. mise installs Node 24.22.2, pnpm, and Vite+; Vite+
uses the package manager declared in `web/package.json` when installing
dependencies. After cloning or switching branches, install the locked
dependencies for editors and direct `pnpm` commands:

```shell
mise install
mise run install-dependencies:web
```

The `mise run lint:web`, `test:web`, and `build:web` tasks install web dependencies
automatically. API-client generation installs its separate `openapi/` dependencies.

#### Editors

Dependencies use standard `web/node_modules` resolution. Remove old Yarn PnP SDK
settings from your editor. For VSCode, select the workspace TypeScript installation
at `web/node_modules/typescript/lib`; in JetBrains IDEs, select pnpm as the package
manager and `web/node_modules/typescript` as the TypeScript package.

Use the Oxc editor extension for formatting and linting. Configuration lives in
`web/vite.config.ts`, not separate ESLint or Biome files. Repository-local editor
settings are intentionally untracked.

Run `mise run lint:web` for formatting, lint and TypeScript checks.

### Dependabot autofixes

Tool version consistency checks run on every pull request, independently of
whether automatic fixes are enabled.

The Dependabot branch autofix workflow is disabled unless the
`DEPENDABOT_AUTOFIX_ENABLED` repository variable is set to `true`. Enabling it
requires a GitHub App installed on this repository with contents write
permission, the app ID in the `DEPENDABOT_AUTOFIX_APP_ID` repository variable,
and its private key in both the `DEPENDABOT_AUTOFIX_PRIVATE_KEY` Actions secret
and Dependabot secret. The workflow runs checks without write credentials; a
separate job applies only allowlisted source and documentation fixes and pushes
them without force.
