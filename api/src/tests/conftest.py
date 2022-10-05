# Global fixtures can be defined in this file

import os

import mongomock
import pytest
from starlette.testclient import TestClient

from app import create_app
from config import config
from infrastructure.clients.mongodb.MongoDatabaseClient import MongoDatabaseClient
from infrastructure.get_repository import get_todo_repository
from infrastructure.repositories.TodoRepository import TodoRepository


@pytest.fixture(scope="function")
def test_client():
    mongo_test_client = mongomock.MongoClient()
    client = MongoDatabaseClient(
        collection_name="todo", database_name=mongo_test_client.TestDB.name, client=mongo_test_client
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


def pytest_addoption(parser):
    parser.addoption("--integration", action="store_true", help="run integration tests")


def pytest_runtest_setup(item):
    if "integration" in item.keywords and not item.config.getvalue("integration"):
        pytest.skip("need --integration option to run")
