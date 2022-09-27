# Setup

## Prerequisites

To work with the template monorepo you'll need to install [these tools](../../running/01-prerequisites.md).

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

## API

From inside the /api folder.

### Create virtualenv

```shell
python3 -m venv .venv
```

Virtual environment is used for running unit tests with pre-commit and upgrade packages. It also can be used to run the application if you not are using Docker.

### Activate virtualenv

<details>
<summary>Linux</summary>

```shell
$ source .venv/bin/activate
```
</details>

<details>
<summary>Windows</summary>

```shell
$ .\venv\Scripts\Activate.ps1
$ pip install --upgrade pip
```

</details>

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

You'll might need to add `"typescript.tsdk": "./template-fastapi-react/web/.yarn/sdks/typescript/lib"` to your workspace settings to make typescript work. Other than that, the committed .vscode folder should contain all the configurations you'll need.
