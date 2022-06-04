from typing import Dict, List, Optional

from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

from config import config
from infrastructure.clients.ClientInterface import ClientInterface


def get_mongo_client(collection: str):
    mongo_database_client = MongoDatabaseClient(
        username=config.MONGODB_USERNAME,
        password=config.MONGODB_PASSWORD,
        host=config.MONGODB_HOSTNAME,
        database=config.MONGODB_DATABASE,
        collection=collection,
        tls=False,
        port=config.MONGODB_PORT,
    )
    return mongo_database_client


class MongoDatabaseClient(ClientInterface[Dict, str]):
    def __init__(
        self,
        username: str,
        password: str,
        host: str,
        database: str,
        collection: str,
        tls: bool,
        port: int,
    ):
        client = MongoClient(
            host=host,
            port=port,
            username=username,
            password=password,
            authSource="admin",  # database,
            tls=tls,
            connectTimeoutMS=5000,
            serverSelectionTimeoutMS=5000,
            retryWrites=False,
        )
        self.handler = client[database]
        self.client = client
        self.collection = collection

    def wipe_db(self):
        databases = self.handler.client.list_database_names()
        databases = [
            database_name
            for database_name in databases
            if database_name not in ("admin", "config", "local")
        ]  # Don't delete the mongo admin or local database
        for database_name in databases:
            self.handler.client.drop_database(database_name)

    def create(self, document: Dict) -> Dict:
        try:
            return self.handler[self.collection].insert_one(document).acknowledged
        except DuplicateKeyError:
            raise Exception

    def get_all(self) -> List[Dict]:
        return self.handler[self.collection].find()

    def find_by_id(self, uid: str) -> Dict:
        return self.handler[self.collection].find_one(filter={"_id": uid})

    def find_by_filter(self, filter, projection) -> List[Dict]:
        return self.handler[self.collection].find_one(
            filter=filter, projection=projection
        )

    def update(self, uid: str, document: Dict) -> Dict:
        self.handler[self.collection].replace_one({"_id": uid}, document)
        return document

    def delete(self, uid: str) -> bool:
        return (
            self.handler[self.collection].delete_one(filter={"_id": uid}).acknowledged
        )

    def find(self, filters: Dict) -> Optional[List[Dict]]:
        return self.handler[self.collection].find(filter=filters)

    def find_one(self, filters: Dict) -> Optional[Dict]:
        return self.handler[self.collection].find_one(filter=filters)

    def insert_many(self, items: List[Dict]):
        return self.handler[self.collection].insert_many(items)

    def delete_many(self, query: Dict):
        return self.handler[self.collection].delete_many(query)
