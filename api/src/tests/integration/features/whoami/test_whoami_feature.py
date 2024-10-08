from starlette.status import HTTP_200_OK
from starlette.testclient import TestClient

from authentication.models import User
from config import config
from tests.integration.mock_authentication import get_mock_jwt_token


class TestWhoami:
    def test_whoami(self, test_app: TestClient):
        config.AUTH_ENABLED = True
        config.TEST_TOKEN = True
        user = User(user_id="1", email="foo@bar.baz", roles=["a"])
        headers = {"Authorization": f"Bearer {get_mock_jwt_token(user)}"}
        response = test_app.get("/whoami", headers=headers)
        data = response.json()
        assert response.status_code == HTTP_200_OK
        assert data["roles"][0] == "a"
        assert data["user_id"] == "1"
