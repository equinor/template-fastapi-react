---
title: 2 Initial setup
---

Initial setup
=============

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

### Install Yarn

This project uses yarn to manage web package dependencies.

```shell
$ npm install -g yarn
```

The installation instructions can be found [here](https://classic.yarnpkg.com/en/docs/install).

### Install packages

```shell
$ yarn install
```