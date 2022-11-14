# Setup

```mdx-code-block
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
```

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

:::caution
If you have to skip the pre-commit tests, you're probably doing something you're not supposed to, and whoever commits after you might have to fix your "mistakes". Consider updating the pre-commit hooks if your code is non-compliant.
:::

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
| [pre-commit/mirrors-prettier](https://github.com/pre-commit/mirrors-prettier)                                      | prettier                | TypeScript/JavaScript/JSON ++ code formatter                                       |
| [pre-commit/mirrors-eslint](https://github.com/pre-commit/mirrors-eslint)                                        | eslint                  | Helps you find and fix problems in your JavaScript code                            |
| [pycqa/flake8](https://gitlab.com/pycqa/flake8)                                                     | flake8                  | Check the style and quality of Python code                                         |
| [local](https://github.com/equinor/template-fastapi-react/blob/main/.pre-commit-config.yaml) | mypy                    | Python type checker                                                                |
|                                                                                     | pytest                  | Python test runner                                                                 |
|                                                                                     |                         |                                                                                    |

</details>

## API

From inside the /api folder.

### Create virtualenv

Virtual environment is used for running unit tests with pre-commit and upgrade packages. It also can be used to run the application if you not are using Docker.

```shell
python3 -m venv .venv
```

### Activate virtualenv

<Tabs groupId="operating-system">
<TabItem value="linux" label="Linux">

```bash
source .venv/bin/activate
```

</TabItem>
<TabItem value="windows" label="Windows">

```powershell
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
```

</TabItem>
</Tabs>

### Install Poetry

Poetry is used to manage Python package dependencies.

```shell
$ pip install poetry
$ poetry config virtualenvs.create false  # Not create venv
```



The installation instructions can be found [here](https://python-poetry.org/docs/#installation).

### Install packages

```shell
$ poetry install
```

## Web

From inside the /web folder.

### Package management

This project uses __Yarn 2 Plug'n'Play__ to manage web package dependencies.  
That means there is no need to run npm/yarn install.  
However, if you want to add/remove/update packages, you need yarn installed locally.

```shell
$ npm install -g yarn
```

#### Yarn PnP in Jetbrains IDEs

To let the IDE know that dependencies can be found in `.yarn` instead of `node_modules`, follow these steps; https://www.jetbrains.com/help/idea/installing-and-removing-external-software-using-node-package-manager.html#ws_npm_yarn_set_up_yarn2 

#### Yarn PnP in VSCode

Because the project uses Yarn PnP, VSCode's language server must use the same typescript executable as the project in order to access dependencies. This is located in `web/.yarn/sdks/typescript/lib`. To use this version, simply open a `.ts(x)` file, open the command palette (default `Ctrl+Shift+P` or `Cmd+Shift+P`), find `TypeScript: Select TypeScript Version...` and select `Use Workspace Version`. 

Not using the correct typescript executable might cause `Cannot find module '***' or its corresponding type declarations.` and `JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.` errors.
