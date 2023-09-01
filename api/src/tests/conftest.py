# Global fixtures can be defined in this file

import os

import mongomock
import pytest
from starlette.datastructures import Headers
from starlette.requests import Request
from starlette.testclient import TestClient

from app import create_app
from config import config
from data_providers.clients.mongodb.mongo_database_client import MongoDatabaseClient
from features.todo.repository.todo_repository import TodoRepository, get_todo_repository


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
    config.AUTH_ENABLED = False
    os.environ["AUTH_ENABLED"] = "False"


@pytest.fixture(scope="function")
def test_app(test_client: MongoDatabaseClient):
    app = create_app()
    client = TestClient(app=app)

    def use_todo_repository_mock():
        return TodoRepository(client=test_client)

    app.dependency_overrides[get_todo_repository] = use_todo_repository_mock
    yield client


@pytest.fixture(scope="function")
def mock_request(
    method: str = "GET",
    server: str = "www.example.com",
    path: str = "/",
    headers: dict = None,
    body: str = None,
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


def pytest_addoption(parser):
    parser.addoption("--integration", action="store_true", help="run integration tests")


def pytest_runtest_setup(item):
    if "integration" in item.keywords and not item.config.getoption("integration"):
        pytest.skip("need --integration option to run")
