# Setup

## Prerequisites

To work with the template monorepo you'll need to install [these tools](../../about/running/01-prerequisites.md).

## Git hooks

When contributing to this project, Git hooks are necessary, as they run certain tests, sanitisers, and formatters.

The project uses [prek](https://prek.j178.dev/) to configure and run Git hooks in
`prek.toml`. The pinned version is installed by mise.

On commit locally, code is automatically formatted and checked by the configured hooks.

### Installation

Install the pinned tools, then initialize the hooks:

```shell
mise install
prek install
```

`prek install` installs the configured `pre-commit` and `commit-msg` hooks.

### Usage

The hooks run on each commit. Run them manually on all files with:

```shell
prek run --all-files
```

Hooks can be skipped with `git commit --no-verify`.

!!! caution "Caution"
    If you have to skip the hooks, you're probably doing something you're not supposed to, and whoever commits after you might have to fix your "mistakes". Consider updating the hooks if your code is non-compliant.

### Hooks
<details>

<summary>Overview</summary>

| Hooks | Purpose |
| ----- | ------- |
| `check-ast`, `check-json`, `check-toml`, `check-yaml` | Validate Python, JSON, TOML and YAML syntax |
| `check-merge-conflict`, `check-case-conflict`, `check-shebang-scripts-are-executable`, `check-executables-have-shebangs` | Check repository consistency and executable scripts |
| `trailing-whitespace`, `end-of-file-fixer`, `mixed-line-ending` | Normalize whitespace and line endings |
| `detect-private-key` | Check for accidentally committed private keys |
| `conventional-pre-commit`, `no-commit-to-branch` | Validate commit messages and prevent commits to protected branch names |
| `ruff-check`, `ruff-format`, `shellcheck`, `shfmt` | Lint and format Python and shell scripts |
| `vite-plus-check` | Format and check web code, import boundaries, TanStack Query rules and types |
| `generate-openapi-spec`, `generate-api-client-from-spec` | Keep the API schema and generated web client in sync |
| `hadolint`, `dclint` | Lint Dockerfiles and Docker Compose files |
| `ensure-consistent-tool-versions`, `ensure-consistent-vite-plus-versions`, `dependabot-is-aware-of-all-lockfiles` | Keep tool versions and Dependabot coverage consistent |

</details>

### Dependabot autofix

The Dependabot autofix workflow is disabled by default. To enable it, configure the
repository variable `DEPENDABOT_AUTOFIX_ENABLED=true`, the variable
`DEPENDABOT_AUTOFIX_APP_ID`, and a GitHub App installed on this repository with
**Contents: read and write** permission. Store its private key as
`DEPENDABOT_AUTOFIX_PRIVATE_KEY` in both **Dependabot secrets** and **Actions secrets**.
Dependabot-triggered runs need the Dependabot secret; the App-token follow-up push
uses the Actions secret. Ordinary Dependabot pushes do not need these credentials
while the enable variable is unset.

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
`web/pnpm-workspace.yaml`. mise installs Node 24.22.2 and pnpm; a global `vp`
installation is not needed. After cloning or switching branches, install the
locked dependencies:

```shell
mise install
mise run install-dependencies:web
```

#### Editors

Dependencies use standard `web/node_modules` resolution. Remove old Yarn PnP SDK
settings from your editor. For VSCode, select the workspace TypeScript installation
at `web/node_modules/typescript/lib`; in JetBrains IDEs, select pnpm as the package
manager and `web/node_modules/typescript` as the TypeScript package.

Use the Oxc editor extension for formatting and linting. Configuration lives in
`web/vite.config.ts`, not separate ESLint or Biome files. Repository-local editor
settings are intentionally untracked.

Run `mise run lint:web` for formatting, lint and both native TypeScript checks and
the TypeScript 6 compiler check. The latter remains available because OpenAPI
generation still requires the JavaScript compiler API removed in TypeScript 7.
