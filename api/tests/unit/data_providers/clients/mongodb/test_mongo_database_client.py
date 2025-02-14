import pytest

from common.exceptions import NotFoundException, ValidationException
from data_providers.clients.mongodb.mongo_database_client import MongoDatabaseClient


class TestMongoDatabaseClient:
    def test_find_one(self, test_client: MongoDatabaseClient):
        document = {"_id": "81549300", "name": "hello"}

        test_client.collection.insert_one(document)
        assert test_client.find_one({"_id": document["_id"]}) == document
        assert test_client.find_one({"name": document["name"]}) == document
        assert test_client.find_one({"_id": document["_id"], "name": document["name"]}) == document
        assert test_client.find_one({"_id": "unknown"}) is None

    def test_create(self, test_client: MongoDatabaseClient):
        document = {"_id": "987321", "name": "alberto"}
        assert test_client.collection.count_documents({}) == 0
        result = test_client.create(document)
        assert test_client.collection.count_documents({}) == 1
        assert result == document
        # try to create entry with already existing id:
        with pytest.raises(ValidationException):
            test_client.create(document)

    def test_get(self, test_client: MongoDatabaseClient):
        document = {"_id": "81549300", "name": "hello"}
        test_client.collection.insert_one(document)
        assert test_client.get(document["_id"]) == document
        with pytest.raises(NotFoundException):
            test_client.get("unknown")

    def test_find(self, test_client: MongoDatabaseClient):
        documents = [
            {"_id": "81549300", "name": "hello"},
            {"_id": "1a2b", "name": "pingvin"},
            {"_id": "987321", "name": "alberto"},
            {"_id": "987456", "name": "alberto"},
        ]
        test_client.collection.insert_many(documents)
        assert list(test_client.find({})) == documents
        assert list(test_client.find({"name": "alberto"})) == [
            documents[2],
            documents[3],
        ]

    def test_list(self, test_client: MongoDatabaseClient):
        documents = [
            {"_id": "81549300", "name": "hello"},
            {"_id": "1a2b", "name": "pingvin"},
            {"_id": "987321", "name": "alberto"},
            {"_id": "987456", "name": "alberto"},
        ]
        test_client.collection.insert_many(documents)
        assert test_client.list_collection() == documents

    def test_update(self, test_client: MongoDatabaseClient):
        document = {"_id": "987321", "name": "alberto"}
        test_client.collection.insert_one(document)
        instance = document
        instance_id = instance["_id"]
        instance["name"] = "Francois"
        assert test_client.find_one({"_id": instance_id}) != instance["name"]
        result = test_client.update(instance_id, instance)
        assert result["name"] == instance["name"]
        assert test_client.find_one({"_id": instance_id}) == instance
        # update with non-existing id
        entries = list(test_client.find({}))
        with pytest.raises(NotFoundException):
            assert test_client.update("instance_id", instance)
        assert list(test_client.find({})) == entries

    def test_delete(self, test_client: MongoDatabaseClient):
        document = {"_id": "987321", "name": "alberto"}
        test_client.collection.insert_one(document)
        test_client.delete(document["_id"])
        assert test_client.collection.count_documents({}) == 0
        assert test_client.find_one({"_id": document["_id"]}) is None
        # try to delete the same entry again
        test_client.delete(document["_id"])
        assert test_client.collection.count_documents({}) == 0

    def test_delete_collection(self, test_client: MongoDatabaseClient):
        documents = [
            {"_id": "81549300", "name": "hello"},
            {"_id": "1a2b", "name": "pingvin"},
            {"_id": "987321", "name": "alberto"},
            {"_id": "987456", "name": "alberto"},
        ]
        test_client.collection.insert_many(documents)
        # add second collection to TestDB:
        test_client.database.create_collection("peppers")
        active_collections = test_client.database.list_collection_names()
        number_of_entries_in_original_collection = test_client.collection.count_documents({})
        assert number_of_entries_in_original_collection > 0
        assert len(active_collections) == 2
        test_client.delete_collection()
        assert test_client.database.list_collection_names() == ["peppers"]
        assert test_client.collection.count_documents({}) == 0

    def test_create_in_empty_database(self, test_client: MongoDatabaseClient):
        document = {"_id": "1a2b", "name": "pingvin"}
        assert test_client.collection.count_documents({}) == 0
        result = test_client.create(document)
        assert test_client.collection.count_documents({}) == 1
        assert result == document

    def test_wipe_db(self, test_client: MongoDatabaseClient):
        documents = [
            {"_id": "81549300", "name": "hello"},
            {"_id": "1a2b", "name": "pingvin"},
            {"_id": "987321", "name": "alberto"},
            {"_id": "987456", "name": "alberto"},
        ]
        test_client.collection.insert_many(documents)
        original_database = test_client.database.client.list_database_names()[0]
        collections_in_original_db = test_client.database.client[original_database].list_collection_names()
        # add admin database (admin collection should not be wiped)
        test_client.database.client["admin"].create_collection("vips")
        active_dbs = test_client.database.client.list_database_names()
        collections_in_admin_db = test_client.database.client["admin"].list_collection_names()
        assert len(active_dbs) == 2
        assert len(collections_in_original_db) == 1
        assert len(collections_in_admin_db) == 1
        test_client.wipe_db()
        assert test_client.database.client.list_database_names() == ["admin"]
        assert test_client.database[collections_in_original_db[0]].count_documents({}) == 0
