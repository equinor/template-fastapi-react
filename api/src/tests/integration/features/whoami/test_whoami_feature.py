import pytest
from starlette.status import HTTP_200_OK

from authentication.mock_token_generator import generate_mock_token
from authentication.models import User
from config import config

pytestmark = pytest.mark.integration


class TestWhoami:
    def test_whoami(self, test_app):
        config.AUTH_ENABLED = True
        config.TEST_TOKEN = True
        user = User(user_id=1, username="foo", roles=["a"])
        headers = {"Authorization": f"Bearer {generate_mock_token(user)}"}
        response = test_app.get("/whoami", headers=headers)
        data = response.json()
        assert response.status_code == HTTP_200_OK
        assert data["roles"][0] == "a"
        assert data["user_id"] == "1"
