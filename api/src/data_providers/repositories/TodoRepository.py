from typing import Optional

from common.exceptions import NotFoundException
from data_providers.clients.ClientInterface import ClientInterface
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from entities.TodoItem import TodoItem


def to_dict(todo_item: TodoItem):
    dict = todo_item.__dict__
    dict["_id"] = todo_item.id
    return dict


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

    def create(self, todo_item: TodoItem) -> Optional[TodoItem]:
        inserted_todo_item = self.client.create(to_dict(todo_item))
        return TodoItem.from_dict(inserted_todo_item)

    def get_all(self) -> list[TodoItem]:
        todo_items = []
        for item in self.client.list():
            todo_items.append(TodoItem.from_dict(item))
        return todo_items

    def find_one(self, filter: dict) -> Optional[TodoItem]:
        todo_item = self.client.find_one(filter)
        if todo_item:
            return TodoItem.from_dict(todo_item)
        return None
