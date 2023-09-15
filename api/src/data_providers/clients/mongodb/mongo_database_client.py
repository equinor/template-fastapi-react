from typing import Any

from pymongo.cursor import Cursor
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from pymongo.mongo_client import MongoClient
from pymongo.results import DeleteResult, InsertManyResult

from common.exceptions import NotFoundException, ValidationException
from config import config
from data_providers.clients.client_interface import ClientInterface

MONGO_CLIENT: MongoClient[dict[str, Any]] = MongoClient(
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


class MongoDatabaseClient(ClientInterface[dict, str]):
    def __init__(self, collection_name: str, database_name: str, client: MongoClient[dict[str, Any]] = MONGO_CLIENT):
        database: Database[dict[str, Any]] = client[database_name]
        self.database = database
        self.collection_name = collection_name
        self.collection = database[collection_name]

    def wipe_db(self) -> None:
        databases = self.database.client.list_database_names()
        databases_to_delete = [
            database_name for database_name in databases if database_name not in ("admin", "config", "local")
        ]  # Don't delete the mongo admin or local database
        for database_name in databases_to_delete:
            self.database.client.drop_database(database_name)

    def delete_collection(self) -> None:
        self.collection.drop()

    def create(self, document: dict[str, Any]) -> dict[str, Any]:
        try:
            result = self.collection.insert_one(document)
            return self.get(str(result.inserted_id))
        except DuplicateKeyError:
            raise ValidationException(message=f"The document with id '{document['_id']}' already exists")

    def list_collection(self) -> list[dict[str, Any]]:
        return list(self.collection.find())

    def get(self, uid: str) -> dict[str, Any]:
        document = self.collection.find_one(filter={"_id": uid})
        if document is None:
            raise NotFoundException
        else:
            return dict(document)

    def update(self, uid: str, document: dict[str, Any]) -> dict[str, Any]:
        if self.collection.find_one(filter={"_id": uid}) is None:
            raise NotFoundException(extra={"uid": uid})
        self.collection.replace_one({"_id": uid}, document)
        return self.get(uid)

    def delete(self, uid: str) -> bool:
        result = self.collection.delete_one(filter={"_id": uid})
        return result.deleted_count > 0

    def find(self, filter: dict[str, Any]) -> Cursor[dict[str, Any]]:
        return self.collection.find(filter=filter)

    def find_one(self, filter: dict[str, Any]) -> dict[str, Any] | None:
        return self.collection.find_one(filter=filter)

    def insert_many(self, items: list[dict[str, Any]]) -> InsertManyResult:
        return self.collection.insert_many(items)

    def delete_many(self, filter: dict[str, Any]) -> DeleteResult:
        return self.collection.delete_many(filter)
