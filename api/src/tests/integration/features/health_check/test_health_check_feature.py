import pytest
from starlette.status import HTTP_200_OK
from starlette.testclient import TestClient

pytestmark = pytest.mark.integration


class TestTodo:
    def test_get(self, test_app: TestClient):
        response = test_app.get("/health-check")
        assert response.status_code == HTTP_200_OK
        assert response.content == b"OK"
