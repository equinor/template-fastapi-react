from pymongo import MongoClient

from config import config
from infrastructure.clients.mongodb.MongoDatabaseClient import MongoDatabaseClient
from infrastructure.repositories.TodoRepository import TodoRepository

MONGO_CLIENT: MongoClient = MongoClient(
    host=config.MONGODB_HOSTNAME,
    port=config.MONGODB_PORT,
    username=config.MONGODB_USERNAME,
    password=config.MONGODB_PASSWORD,
    authSource="admin",
    tls=False,
    connectTimeoutMS=5000,
    serverSelectionTimeoutMS=5000,
    retryWrites=False,
)


def get_todo_repository():
    mongo_database_client = MongoDatabaseClient(
        collection_name="todo", database_name=config.MONGODB_DATABASE, client=MONGO_CLIENT
    )
    return TodoRepository(client=mongo_database_client)
