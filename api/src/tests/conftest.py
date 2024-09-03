# Global fixtures can be defined in this file

import os

import mongomock
import pytest
from starlette.datastructures import Headers
from starlette.requests import Request
from starlette.testclient import TestClient

from app import create_app
from authentication.authentication import auth_with_jwt
from config import config as project_config
from data_providers.clients.mongodb.mongo_database_client import MongoDatabaseClient
from features.todo.repository.todo_repository import TodoRepository, get_todo_repository
from tests.integration.mock_authentication import mock_auth_with_jwt


@pytest.fixture(scope="function")
def test_client():
    mongo_test_client = mongomock.MongoClient()
    client = MongoDatabaseClient(
        collection_name="todos", database_name=mongo_test_client.TestDB.name, client=mongo_test_client
    )
    yield client
    client.wipe_db()


@pytest.fixture(autouse=True)
def disable_auth():
    project_config.AUTH_ENABLED = False
    os.environ["AUTH_ENABLED"] = "False"


@pytest.fixture(scope="function")
def test_app(test_client: MongoDatabaseClient):
    app = create_app()
    client = TestClient(app=app)

    def use_todo_repository_mock():
        return TodoRepository(client=test_client)

    app.dependency_overrides[get_todo_repository] = use_todo_repository_mock
    app.dependency_overrides[auth_with_jwt] = mock_auth_with_jwt
    yield client


@pytest.fixture(scope="function")
def mock_request(
    method: str = "GET",
    server: str = "www.example.com",
    path: str = "/",
    headers: dict | None = None,
    body: bytes | None = None,
) -> Request:
    if headers is None:
        headers = {}
    request = Request(
        {
            "type": "http",
            "path": path,
            "headers": Headers(headers).raw,
            "http_version": "1.1",
            "method": method,
            "scheme": "https",
            "client": ("127.0.0.1", 8080),
            "server": (server, 443),
        }
    )
    if body:

        async def request_body():
            return body

        request.body = request_body
    return request


def pytest_configure(config: pytest.Config):
    """Add markers to be recognised by pytest."""
    has_unit_option = config.getoption("unit", default=False)
    has_integration_option = config.getoption("integration", default=False)
    marker_expr = config.getoption("markexpr", default="")
    if marker_expr != "" and (has_integration_option or has_unit_option):
        pytest.exit("Invalid options: Cannot use --markexpr with --unit or --integration options", 4)


def pytest_addoption(parser):
    """Add option to pytest parser for running unit/integration tests."""
    parser.addoption("--unit", action="store_true", default=False, help="run unit tests")
    parser.addoption("--integration", action="store_true", default=False, help="run integration tests")


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]):
    """Add markers to tests based on folder structure."""
    unit_tests_directory = config.rootpath / "src/tests/unit"
    integration_tests_directory = config.rootpath / "src/tests/integration"
    for item in items:
        if item.path.is_relative_to(unit_tests_directory):
            item.add_marker("unit")
        if item.path.is_relative_to(integration_tests_directory):
            item.add_marker("integration")


def pytest_runtest_setup(item: pytest.Item):
    """Skip tests based on options provided."""
    has_unit_option = item.config.getoption("unit", default=False)
    has_integration_option = item.config.getoption("integration", default=False)
    match (has_unit_option, has_integration_option):
        case (False, True):
            # skip unit tests
            if "unit" in item.keywords:
                pytest.skip("unit tests are skipped when explicitly running integration tests")
        case (True, False):
            # skip integration tests
            if "integration" in item.keywords:
                pytest.skip("integration tests are skipped when explicitly running unit tests")
        case _:
            # run all tests
            return
