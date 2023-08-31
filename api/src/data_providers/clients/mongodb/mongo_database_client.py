from pymongo.cursor import Cursor
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from pymongo.mongo_client import MongoClient

from common.exceptions import NotFoundException, ValidationException
from config import config
from data_providers.clients.client_interface import ClientInterface

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


class MongoDatabaseClient(ClientInterface[dict, str]):
    def __init__(self, collection_name: str, database_name: str, client: MongoClient = MONGO_CLIENT):
        database: Database = client[database_name]
        self.database = database
        self.collection_name = collection_name
        self.collection = database[collection_name]

    def wipe_db(self):
        databases = self.database.client.list_database_names()
        databases_to_delete = [
            database_name for database_name in databases if database_name not in ("admin", "config", "local")
        ]  # Don't delete the mongo admin or local database
        for database_name in databases_to_delete:
            self.database.client.drop_database(database_name)

    def delete_collection(self):
        self.collection.drop()

    def create(self, document: dict) -> dict:
        try:
            result = self.collection.insert_one(document)
            return self.get(str(result.inserted_id))
        except DuplicateKeyError:
            raise ValidationException(message=f"The document with id '{document['_id']}' already exists")

    def list_collection(self) -> list[dict]:
        return list(self.collection.find())

    def get(self, uid: str) -> dict:
        document = self.collection.find_one(filter={"_id": uid})
        if document is None:
            raise NotFoundException
        else:
            return dict(document)

    def update(self, uid: str, document: dict) -> dict:
        if self.collection.find_one(filter={"_id": uid}) is None:
            raise NotFoundException(extra={"uid": uid})
        self.collection.replace_one({"_id": uid}, document)
        return self.get(uid)

    def delete(self, uid: str) -> bool:
        result = self.collection.delete_one(filter={"_id": uid})
        return result.deleted_count > 0  # type: ignore

    def find(self, filter: dict) -> Cursor:
        return self.collection.find(filter=filter)

    def find_one(self, filter: dict) -> dict | None:
        return self.collection.find_one(filter=filter)  # type: ignore

    def insert_many(self, items: list[dict]):
        return self.collection.insert_many(items)

    def delete_many(self, filter: dict):
        return self.collection.delete_many(filter)
