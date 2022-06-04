# GTS

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
![Docstring coverage: Interrogate](https://github.com/equinor/gts/blob/main/interrogate_badge.svg)

## How-to guides

### Create and activate local venv

```shell
cd api/  # should be in api/
python3 -m venv .venv  # create
source .venv/bin/activate  # activate
```


### Install Poetry & dependencies

```shell
pip install poetry
poetry config virtualenvs.create false  # poetry should not create venv
poetry install  # install dependencies
```


### Add Python package to Poetry

```shell
cd api/
# Add package to pyproject.toml
poetry update
```


### Pre-commit

```shell
pre-commit install # tell pre-commit to always run for this repository
cd api/
python3 -m venv .venv
source .venv/bin/activate
pre-commit run --all-files
```
### Run backend app.py with Uvicorn

```shell
cd api/src/  # location of app.py
uvicorn app:create_app --reload
```

<details><summary>Check for missing docstrings with Interrogate</summary>

### Check for missing docstrings with Interrogate
```shell
cd api/
interrogate [PATH]

RESULT: PASSED (minimum: 85.0%, actual: 100.0%)
```
Add verbosity to see a summary:
```shell
interrogate -vv [PATH]

-------------------------------------- Detailed Coverage --------------------------------------
| Name                                                            |                    Status |
|-----------------------------------------------------------------|---------------------------|
| app.py (module)                                                 |                   COVERED |
|   create_app (L18)                                              |                   COVERED |
|     create_app.add_process_time_header (L29)                    |                   COVERED |
|   cli (L45)                                                     |                   COVERED |
|   run (L51)                                                     |                   COVERED |
|-----------------------------------------------------------------|---------------------------|
| config.py (module)                                              |                   COVERED |
|   Config (L6)                                                   |                   COVERED |
|-----------------------------------------------------------------|---------------------------|
| controllers/hello_world.py (module)                             |                   COVERED |
|   hello_world (L9)                                              |                   COVERED |
|-----------------------------------------------------------------|---------------------------|
| utils/logging.py (module)                                       |                   COVERED |
|-----------------------------------------------------------------|---------------------------|

------------------------------------------- Summary -------------------------------------------
| Name                                |       Total |       Miss |       Cover |       Cover% |
|-------------------------------------|-------------|------------|-------------|--------------|
| app.py                              |           5 |          0 |           5 |         100% |
| config.py                           |           2 |          0 |           2 |         100% |
| controllers/hello_world.py          |           2 |          0 |           2 |         100% |
| utils/logging.py                    |           1 |          0 |           1 |         100% |
|-------------------------------------|-------------|------------|-------------|--------------|
| TOTAL                               |          10 |          0 |          10 |       100.0% |
----------------------- RESULT: PASSED (minimum: 85.0%, actual: 100.0%) -----------------------
```
</details>
