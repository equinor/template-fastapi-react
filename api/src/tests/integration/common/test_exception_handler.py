import pytest
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from starlette.testclient import TestClient

pytestmark = pytest.mark.integration


def test_exception_handler_validation_error(test_app: TestClient):
    response = test_app.post("/todos", json={"title": 1})
    response.json()

    assert response.status_code == HTTP_422_UNPROCESSABLE_ENTITY
    assert {
        "status": 422,
        "type": "RequestValidationError",
        "message": "The received values are invalid",
        "debug": "The received values are invalid according to the endpoints model definition",
        "extra": {
            "detail": [
                {
                    "type": "string_type",
                    "loc": ["body", "title"],
                    "msg": "Input should be a valid string",
                    "input": 1,
                    "url": "https://errors.pydantic.dev/2.1.2/v/string_type",
                }
            ],
            "body": {"title": 1},
        },
    }
