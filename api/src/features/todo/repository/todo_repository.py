from common.exceptions import NotFoundException
from config import config
from data_providers.clients.client_interface import ClientInterface
from data_providers.clients.mongodb.mongo_database_client import MongoDatabaseClient
from features.todo.entities.todo_item import TodoItem
from features.todo.repository.todo_repository_interface import TodoRepositoryInterface


def to_dict(todo_item: TodoItem):
    _dict = todo_item.__dict__
    _dict["_id"] = todo_item.id
    return _dict


def get_todo_repository():
    mongo_database_client = MongoDatabaseClient(collection_name="todos", database_name=config.MONGODB_DATABASE)
    return TodoRepository(client=mongo_database_client)


class TodoRepository(TodoRepositoryInterface):
    client: ClientInterface

    def __init__(self, client: ClientInterface):
        self.client = client

    def update(self, todo_item: TodoItem) -> TodoItem:
        updated_todo_item = self.client.update(todo_item.id, to_dict(todo_item))
        return TodoItem.from_dict(updated_todo_item)

    def delete(self, todo_item_id: str) -> None:
        is_deleted = self.client.delete(todo_item_id)
        if not is_deleted:
            raise NotFoundException

    def delete_all(self) -> None:
        self.client.delete_collection()

    def get(self, todo_item_id: str) -> TodoItem:
        todo_item = self.client.get(todo_item_id)
        return TodoItem.from_dict(todo_item)

    def create(self, todo_item: TodoItem) -> TodoItem | None:
        inserted_todo_item = self.client.create(to_dict(todo_item))
        return TodoItem.from_dict(inserted_todo_item)

    def get_all(self) -> list[TodoItem]:
        todo_items = []
        for item in self.client.list_collection():
            todo_items.append(TodoItem.from_dict(item))
        return todo_items

    def find_one(self, filter: dict) -> TodoItem | None:
        todo_item = self.client.find_one(filter)
        if todo_item:
            return TodoItem.from_dict(todo_item)
        return None
