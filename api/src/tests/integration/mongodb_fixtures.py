import pytest

from infrastructure.clients.mongodb.MongoClient import get_mongo_client


@pytest.fixture(scope="session")
def mongo_session():
    client = get_mongo_client(collection="todo")
    yield client
    client.wipe_db()
    client.client.close()


@pytest.fixture(scope="function")
def database(mongo_session):
    yield mongo_session
    mongo_session.delete_many({})
