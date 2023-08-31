import pytest

from common.exceptions import NotFoundException, ValidationException
from data_providers.clients.mongodb.mongo_database_client import MongoDatabaseClient
from features.todo.entities.todo_item import TodoItem
from features.todo.repository.todo_repository import TodoRepository


class TestTodoRepository:
    @pytest.fixture(autouse=True)
    def _setup_repository(self, test_client: MongoDatabaseClient):
        self.repository = TodoRepository(client=test_client)

    def test_create(self):
        todo_item = TodoItem(id="1234", title="todo 1", user_id="xyz")
        self.repository.create(todo_item)
        assert len(self.repository.get_all()) == 1

    def test_create_already_exists(self):
        todo_item_1 = TodoItem(id="1234", title="todo 1", user_id="xyz")
        self.repository.create(todo_item_1)
        with pytest.raises(ValidationException):
            todo_item_2 = TodoItem(id="1234", title="todo 1", user_id="xyz")
            self.repository.create(todo_item_2)

    def test_find_item_that_exist(self):
        documents = [
            {"_id": "81549300", "title": "todo 1", "user_id": "xyz"},
            {"_id": "1a2b", "title": "todo 2", "user_id": "xyz"},
            {"_id": "987321", "title": "todo 3", "user_id": "abc"},
            {"_id": "987456", "title": "todo 4", "user_id": "abc"},
        ]
        self.repository.client.insert_many(documents)
        todo_item = self.repository.find_one({"title": "todo 2", "user_id": "xyz"})
        assert todo_item is not None and todo_item.id == "1a2b"

    def test_find_item_that_does_not_exist(self):
        documents = [
            {"_id": "81549300", "title": "todo 1", "user_id": "xyz"},
            {"_id": "1a2b", "title": "todo 2", "user_id": "xyz"},
            {"_id": "987321", "title": "todo 3", "user_id": "abc"},
            {"_id": "987456", "title": "todo 4", "user_id": "abc"},
        ]
        self.repository.client.insert_many(documents)
        assert self.repository.find_one({"_id": "invalid"}) is None

    def test_find_item_of_other_user(self):
        documents = [
            {"_id": "81549300", "title": "todo 1", "user_id": "xyz"},
            {"_id": "1a2b", "title": "todo 2", "user_id": "xyz"},
            {"_id": "987321", "title": "todo 3", "user_id": "abc"},
            {"_id": "987456", "title": "todo 4", "user_id": "abc"},
        ]
        self.repository.client.insert_many(documents)
        assert self.repository.find_one({"_id": "1a2b", "user_id": "abc"}) is None

    def test_get_item_that_does_exist(self):
        documents = [
            {"_id": "81549300", "title": "todo 1", "user_id": "xyz"},
            {"_id": "1a2b", "title": "todo 2", "user_id": "xyz"},
            {"_id": "987321", "title": "todo 3", "user_id": "abc"},
            {"_id": "987456", "title": "todo 4", "user_id": "abc"},
        ]
        self.repository.client.insert_many(documents)
        assert self.repository.get("987321").id == "987321"

    def test_get_item_that_does_not_exist(self):
        documents = [
            {"_id": "81549300", "title": "todo 1", "user_id": "xyz"},
            {"_id": "1a2b", "title": "todo 2", "user_id": "xyz"},
            {"_id": "987321", "title": "todo 3", "user_id": "abc"},
            {"_id": "987456", "title": "todo 4", "user_id": "abc"},
        ]
        self.repository.client.insert_many(documents)
        with pytest.raises(NotFoundException):
            self.repository.get("invalid")

    def test_update_item(self):
        todo_item = TodoItem(id="81549300", title="todo 1", user_id="xyz")
        self.repository.create(todo_item)
        todo_item_to_update = TodoItem(id="81549300", title="Updated title", user_id="xyz")
        self.repository.update(todo_item=todo_item_to_update)
        assert self.repository.get("81549300").title == "Updated title"

    def test_update_item_that_does_not_exist(self):
        todo_item_to_update = TodoItem(id="unknown", title="Updated title", user_id="xyz")
        with pytest.raises(NotFoundException):
            self.repository.update(todo_item_to_update)

    def test_delete(self):
        documents = [
            {"_id": "81549300", "title": "todo 1", "user_id": "xyz"},
            {"_id": "1a2b", "title": "todo 2", "user_id": "xyz"},
        ]
        self.repository.client.insert_many(documents)
        assert len(self.repository.get_all()) == 2
        self.repository.delete("81549300")
        assert len(self.repository.get_all()) == 1
        assert self.repository.get_all() == [self.repository.get("1a2b")]

    def test_delete_all(self):
        documents = [
            {"_id": "81549300", "title": "todo 1", "user_id": "xyz"},
            {"_id": "1a2b", "title": "todo 2", "user_id": "xyz"},
        ]
        self.repository.client.insert_many(documents)
        assert len(self.repository.get_all()) == 2
        self.repository.delete_all()
        assert len(self.repository.get_all()) == 0
