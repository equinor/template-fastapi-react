from typing import Optional

from entities.TodoItem import TodoItem
from features.todo.interfaces.TodoRepositoryInterface import TodoRepositoryInterface
from infrastructure.clients.ClientInterface import ClientInterface
from infrastructure.clients.mongodb.MongoDatabaseClient import MongoDatabaseClient


def to_dict(todo_item: TodoItem):
    dict = todo_item.__dict__
    dict["_id"] = todo_item.id
    return dict


class TodoRepository(TodoRepositoryInterface):
    client: ClientInterface

    def __init__(self, client: ClientInterface = MongoDatabaseClient(collection_name="todo")):
        self.client = client

    def update(self, todo_item: TodoItem) -> TodoItem:
        updated_todo_item = self.client.update(todo_item.id, to_dict(todo_item))
        return TodoItem.from_dict(updated_todo_item)

    def delete(self, todo_item_id: str) -> None:
        self.client.delete(todo_item_id)

    def get(self, todo_item_id: str) -> TodoItem:
        todo_item = self.client.get(todo_item_id)
        return TodoItem.from_dict(todo_item)

    def create(self, todo_item: TodoItem) -> Optional[TodoItem]:
        inserted_todo_item = self.client.create(to_dict(todo_item))
        return TodoItem.from_dict(inserted_todo_item)

    def get_all(self) -> list[TodoItem]:
        todo_items = []
        for item in self.client.list():
            todo_items.append(TodoItem.from_dict(item))
        return todo_items
