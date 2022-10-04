from typing import Dict, List, Optional

from pymongo import MongoClient
from pymongo.collection import Collection, Cursor
from pymongo.errors import DuplicateKeyError

from common.exceptions import NotFoundException, ValidationException
from config import config
from infrastructure.clients.ClientInterface import ClientInterface

DEFAULT_MONGO_CLIENT: MongoClient = MongoClient(
    host=config.MONGODB_HOSTNAME,
    port=config.MONGODB_PORT,
    username=config.MONGODB_USERNAME,
    password=config.MONGODB_PASSWORD,
    authSource="admin",  # database, config.MONGODB_DATABASE
    tls=False,
    connectTimeoutMS=5000,
    serverSelectionTimeoutMS=5000,
    retryWrites=False,
)


class MongoDatabaseClient(ClientInterface[Dict, str]):
    def __init__(self, collection_name: str, client: MongoClient = DEFAULT_MONGO_CLIENT):
        self.handler = client[config.MONGODB_DATABASE]
        self.collection: Collection = self.handler[collection_name]

    def wipe_db(self):
        databases = self.handler.client.list_database_names()
        databases_to_delete = [
            database_name for database_name in databases if database_name not in ("admin", "config", "local")
        ]  # Don't delete the mongo admin or local database
        for database_name in databases_to_delete:
            self.handler.client.drop_database(database_name)

    def create(self, document: Dict) -> Dict:
        try:
            result = self.collection.insert_one(document)
            return self.get(str(result.inserted_id))
        except DuplicateKeyError:
            raise ValidationException(message=f"The document with id '{document['_id']}' already exists")

    def list(self) -> List[dict]:
        return list(self.collection.find())

    def get(self, uid: str) -> Dict:
        document = self.collection.find_one(filter={"_id": uid})
        if document is None:
            raise NotFoundException
        else:
            return dict(document)

    def update(self, uid: str, document: Dict) -> Dict:
        if self.collection.find_one(filter={"_id": uid}) is None:
            raise NotFoundException(extra={"uid": uid})
        self.collection.replace_one({"_id": uid}, document)
        return self.get(uid)

    def delete(self, uid: str) -> bool:
        return self.collection.delete_one(filter={"_id": uid}).acknowledged

    def find(self, filters: Dict) -> Cursor:
        return self.collection.find(filter=filters)

    def find_one(self, filters: Dict) -> Optional[Dict]:
        return self.collection.find_one(filter=filters)

    def insert_many(self, items: List[Dict]):
        return self.collection.insert_many(items)

    def delete_many(self, query: Dict):
        return self.collection.delete_many(query)
