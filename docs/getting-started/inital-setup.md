---
title: 2 Initial setup
---

Initial setup
=============

## Install pre-commit

```
pre-commit install
# to enforce conventional commits
pre-commit install --hook-type commit-msg
```

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
