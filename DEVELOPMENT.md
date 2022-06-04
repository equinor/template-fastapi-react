<!-- markdownlint-configure-file {
  "MD013": {
    "code_blocks": false,
    "tables": false
  },
  "MD033": false,
  "MD041": false
} -->

<div align="center">

# Development guideline

How to get the boilerplate up and running on your local machine for development and testing purposes.

[Repository content](#repository-content) •
[Initial setup](#initial-setup) •
[Getting started](#getting-started) •
[Upgrading packages](#upgrading-packages) •
[Testing](#testing) •
[Pre commit](#pre-commit) •

</div>

## Repository content

```
├── api/ - backend code
│   web/ - frontend code
├── docker-compose.override.yml - run in development mode locally
├── docker-compose.production.yml - run in production mode locally
├── docker-compose.yml - common settings for local and production mode
├── .env-template - environment variables
└── ...
```

## Initial setup

Create and activate a local [virtualenv](https://pytr.readthedocs.io/tr/latest/tutorial/venv.html).:

<details>
<summary>Linux and macOS</summary>

```shell
cd api/  
python3 -m venv .venv  
source .venv/bin/activate  
```
</details>

<details>
<summary>Windows</summary>

```shell
cd api
python3 -m venv venv  
.\venv\Scripts\Activate.ps1  
pip install --upgrade pip  
```

</details>

## Getting started

You can run and debug the application using or not using containers.


<details>
<summary>Using containers</summary>

```shell
docker-compose up
```

The web app will be served at http://localhost.

</details>

<details>
<summary>Not using containers</summary>

First activate local venv.

Install poetry and dependencies:

```shell
pip install poetry
poetry config virtualenvs.create false  # poetry should not create venv
poetry install  
```

Run backend app.py with Uvicorn:

```shell
cd api/src/  # go to the location of app.py
uvicorn app:create_app --reload
```

</details>

Visit localhost in your web browser to access the web app, or localhost/api/v1 for the API.

### API documentation

- OpenAPI docs can be found at /docs
- OpenAPI spec can be found at /openapi.json

## Upgrading packages

### Python package

```shell
cd api/
# Add or remove package to pyproject.toml
poetry update
```

If you run the application using containers, you need to do `docker-compose build` and then `docker-compose up` to get the changes.

If you run not using containers, you need to do `poetry install`.

## Testing

### Run unit tests

<details>
<summary>Using containers</summary>

```shell
docker-compose run --rm api pytest
docker-compose run --rm web yarn test
```

</details>

<details>
<summary>Not using containers</summary>

```shell
cd api/
pytest
cd web/
yarn test
```

</details>

## Pre-commit

We use pre-commit to do a minimum of checks locally before committing.

The project provides a [`.pre-commit-config.yaml`](.pre-commit-config.yaml)-file that is used to setup git _pre-commit hooks_.

#### 1) Install pre-commit

Tell pre-commit to always run for this repository on every commit.

```shell
pre-commit install 
```
Pre-commit tests can be skipped with `git commit --no-verify`

#### 2) Run pre-commit manually on all files

```shell
pre-commit run --all-files
```