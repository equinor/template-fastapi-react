import pytest

from infrastructure.clients.mongodb.MongoDatabaseClient import MongoDatabaseClient


@pytest.fixture(scope="session")
def mongo_session():
    client = MongoDatabaseClient(collection_name="todo")
    yield client
    client.wipe_db()
    client.handler.client.close()


@pytest.fixture(scope="function")
def database(mongo_session):
    yield mongo_session
    mongo_session.delete_many({})
