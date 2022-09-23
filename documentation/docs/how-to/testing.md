---
title: Testing
---

Testing
=============


## API

The application has two types of API tests: unit tests and integration tests.

### Unit tests

You will find unit tests under `src/tests/unit`.

Using docker:

```shell
docker-compose run --rm api pytest
```

Without using docker:

```shell
pytest
```

As a general rule, unit tests should not have any external dependencies - especially on the file system.

### Integration tests

The integrations tests can be found under `src/tests/integration`.

To run integration tests add `--integration` as argument for pytest.

These tests depends on mongodb and that it's running.

## Web

### Unit tests

Without using docker:

```shell
docker-compose run --rm web yarn test
```

Not using docker:

```shell
cd web/
yarn test
```
