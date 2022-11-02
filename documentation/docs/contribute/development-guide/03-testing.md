# Testing

## API

```mdx-code-block
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
```

The application has two types of API tests: unit tests and integration tests.

### Unit tests

You will find unit tests under `src/tests/unit`.

<Tabs groupId="api-testing">
<TabItem value="using-docker" label="Using docker">

```shell
docker-compose run --rm api pytest
```

</TabItem>
<TabItem value="without-using-docker" label="Without using docker">

```shell
cd api/
pytest
```

</TabItem>
</Tabs>


As a general rule, unit tests should not have any external dependencies - especially on the file system.

### Integration tests

The integrations tests can be found under `src/tests/integration`.

To run integration tests add `--integration` as argument for pytest.

These tests depends on mongodb and that it's running.

## Web

### Unit tests

<Tabs groupId="web-testing">
<TabItem value="using-docker" label="Using docker">

```shell
docker-compose run --rm web yarn test
```

</TabItem>
<TabItem value="without-using-docker" label="Without using docker">

```shell
cd web/
yarn test
```

</TabItem>
</Tabs>
