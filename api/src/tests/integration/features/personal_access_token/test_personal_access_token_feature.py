import pytest
from starlette.status import HTTP_200_OK

from authentication.mock_token_generator import generate_mock_token
from authentication.models import User
from config import config

pytestmark = pytest.mark.integration


class TestPersonalAccessToken:
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        config.AUTH_ENABLED = True
        config.TEST_TOKEN = True

    def test_create(self, test_app):
        user = User(user_id=1, username="foo", roles=["a"])
        headers = {"Authorization": f"Bearer {generate_mock_token(user)}"}
        response = test_app.post("/api/v1/token", headers=headers)
        assert response.status_code == HTTP_200_OK
