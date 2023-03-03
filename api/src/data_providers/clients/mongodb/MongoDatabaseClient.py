from typing import Dict, List, Optional

from pymongo.cursor import Cursor
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from pymongo.mongo_client import MongoClient

from common.exceptions import NotFoundException, ValidationException
from data_providers.clients.ClientInterface import ClientInterface


class MongoDatabaseClient(ClientInterface[Dict, str]):
    def __init__(self, collection_name: str, database_name: str, client: MongoClient):
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
        result = self.collection.delete_one(filter={"_id": uid})
        return result.deleted_count > 0  # type: ignore[no-any-return]

    def find(self, filter: Dict) -> Cursor:
        return self.collection.find(filter=filter)

    def find_one(self, filter: Dict) -> Optional[Dict]:
        return self.collection.find_one(filter=filter)  # type: ignore[no-any-return]

    def insert_many(self, items: List[Dict]):
        return self.collection.insert_many(items)

    def delete_many(self, filter: Dict):
        return self.collection.delete_many(filter)
