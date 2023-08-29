import pytest
from starlette.status import (
    HTTP_200_OK,
    HTTP_404_NOT_FOUND,
    HTTP_422_UNPROCESSABLE_ENTITY,
)
from starlette.testclient import TestClient

from data_providers.clients.client_interface import ClientInterface

pytestmark = pytest.mark.integration


class TestTodo:
    @pytest.fixture(autouse=True)
    def setup_database(self, test_client: ClientInterface):
        test_client.insert_many(
            [
                {"_id": "1", "id": "1", "title": "title 1", "user_id": "nologin"},
                {"_id": "2", "id": "2", "title": "title 2", "user_id": "nologin"},
            ]
        )

    def test_get_todo_all(self, test_app: TestClient):
        response = test_app.get("/todos")
        items = response.json()

        assert response.status_code == HTTP_200_OK
        assert len(items) == 2
        assert items[0]["id"] == "1"
        assert items[0]["title"] == "title 1"
        assert items[1]["id"] == "2"
        assert items[1]["title"] == "title 2"

    def test_get_todo_by_id(self, test_app: TestClient):
        response = test_app.get("/todos/1")

        assert response.status_code == HTTP_200_OK
        assert response.json()["id"] == "1"
        assert response.json()["title"] == "title 1"

    def test_get_todo_should_return_not_found(self, test_app: TestClient):
        response = test_app.get("/todos/unknown")
        assert response.status_code == HTTP_404_NOT_FOUND

    def test_add_todo(self, test_app: TestClient):
        response = test_app.post("/todos", json={"title": "title 3"})
        item = response.json()

        assert response.status_code == HTTP_200_OK
        assert item["title"] == "title 3"

    def test_add_todo_should_return_unprocessable_when_invalid_entity(self, test_app: TestClient):
        response = test_app.post("/todos", json=None)

        assert response.status_code == HTTP_422_UNPROCESSABLE_ENTITY

    def test_update_todo(self, test_app):
        response = test_app.put("/todos/1", json={"title": "title 1 updated", "is_completed": False})

        assert response.status_code == HTTP_200_OK
        assert response.json()["success"]

    def test_update_todo_should_return_not_found(self, test_app):
        response = test_app.put("/todos/unknown", json={"title": "something", "is_completed": False})
        assert response.status_code == HTTP_404_NOT_FOUND

    def test_update_todo_should_return_unprocessable_when_invalid_entity(self, test_app: TestClient):
        response = test_app.put("/todos/1", json={"title": ""})

        assert response.status_code == HTTP_422_UNPROCESSABLE_ENTITY

    def test_delete_todo(self, test_app: TestClient):
        response = test_app.delete("/todos/1")

        assert response.status_code == HTTP_200_OK
        assert response.json()["success"]

    def test_delete_todo_should_return_not_found(self, test_app: TestClient):
        response = test_app.delete("/todos/unknown")
        assert response.status_code == HTTP_404_NOT_FOUND
