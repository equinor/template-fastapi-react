---
title: Pre-commit
---

Pre-commit
=============

When contributing to this project, pre-commit is necessary, as it runs certain tests, sanitisers, and formatters.

The project provides a `.pre-commit-config.yaml` file that is used to setup git _pre-commit hooks_.

On commit locally, code is automatically formatted, checked for security vulnerabilities using pre-commit git hooks.

## Installation

If you don't have it installed, run

```shell
pre-commit install
```

This tell pre-commit to always run for this repository on every commit.
## Usage

Pre-commit will run on every commit, but can also be run manually on all files:

```shell
pre-commit run --all-files
```

Pre-commit tests can be skipped on commits with `git commit --no-verify`.

