# Prerequisites

In order to run you need to have installed:

- [Docker](https://www.docker.com/)
- Git

## Local setup for backend development

This template uses [uv](https://docs.astral.sh/uv/) as package and project manager.

Follow the installation instructions for your OS, then verify your uv installation by running:
```zsh
uv --version
```

To set up your python environment, go to the `/api` folder, from here you can either do it explicitly with `uv sync --dev` or simply run:
```zsh
uv run pre-commit
```

This will automagically install the required python version (if needed), create a venv for the project and install the required dependencies defined in the pyproject.toml file.
