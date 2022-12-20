# mypy: ignore-errors

import logging

import pytest
import schemathesis
from hypothesis.stateful import run_state_machine_as_test
from schemathesis.specs.openapi.loaders import from_asgi

from app import create_app
from data_providers.clients.mongodb.MongoDatabaseClient import MongoDatabaseClient
from data_providers.get_repository import get_todo_repository
from data_providers.repositories.TodoRepository import TodoRepository

# To see how the endpoints and been called
logger = logging.getLogger(__file__)
logger.setLevel(logging.INFO)
file_handler = logging.FileHandler("schemathesis.log", "w+")
file_handler.setLevel(logging.DEBUG)
logger.addHandler(file_handler)

# FastAPI is using newer OpenAPI specification
schemathesis.fixups.install()

app = create_app(root_path="/")
schema = from_asgi("/openapi.json", app)


@pytest.fixture
def state_machine(test_client: MongoDatabaseClient):
    # We extend the OpenAPI schema with "links"
    # to describe how the output from one operation
    # can be used as input for other operations.
    # More details can be found here: https://schemathesis.readthedocs.io/en/stable/stateful.html
    schema.add_link(
        source=schema["/todos"]["POST"],
        target=schema["/todos/{id}"]["GET"],
        status_code="201",
        parameters={"id": "$response.body#/id"},
    )
    schema.add_link(
        source=schema["/todos"]["POST"],
        target=schema["/todos/{id}"]["PUT"],
        status_code="201",
        parameters={"id": "$response.body#/id"},
    )
    schema.add_link(
        source=schema["/todos"]["POST"],
        target=schema["/todos/{id}"]["DELETE"],
        status_code="201",
        parameters={"id": "$response.body#/id"},
    )

    def use_todo_repository_mock():
        return TodoRepository(client=test_client)

    app.dependency_overrides[get_todo_repository] = use_todo_repository_mock

    class TestAPI(schema.as_state_machine()):
        def after_call(self, response, case):
            logger.info(
                "%s %s -> %d %s %s",
                case.method,
                case.path,
                response.status_code,
                case.__repr__(),
                response.content.__repr__(),
            )

    return TestAPI


def test_stateful(state_machine):
    run_state_machine_as_test(
        state_machine,
    )
