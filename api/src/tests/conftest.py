# Global fixtures can be defined in this file

import os

import pytest
from starlette.testclient import TestClient

from app import create_app
from config import config

pytest_plugins = ["integration.mongodb_fixtures"]


@pytest.fixture(autouse=True)
def disable_auth():
    config.AUTH_ENABLED = False


@pytest.fixture(scope="module")
def test_app():
    os.environ["AUTH_ENABLED"] = "False"
    client = TestClient(app=create_app())
    yield client  # testing happens here


def pytest_addoption(parser):
    parser.addoption("--integration", action="store_true", help="run integration tests")


def pytest_runtest_setup(item):
    if "integration" in item.keywords and not item.config.getvalue("integration"):
        pytest.skip("need --integration option to run")
