from typing import Optional

from entities.TodoItem import TodoItem
from features.todo.exceptions import TodoItemNotFoundError
from features.todo.interfaces.TodoRepositoryInterface import TodoRepositoryInterface
from infrastructure.clients.ClientInterface import ClientInterface
from infrastructure.clients.mongodb.MongoClient import get_mongo_client


def to_dict(todo_item: TodoItem):
    dict = todo_item.__dict__
    dict["_id"] = todo_item.id
    return dict


class TodoRepository(TodoRepositoryInterface):
    client: ClientInterface

    def __init__(self, client: ClientInterface = get_mongo_client(collection="todo")):
        self.client = client

    def update(self, todo_item: TodoItem) -> Optional[TodoItem]:
        self.client.update(todo_item.id, to_dict(todo_item))
        return TodoItem.from_dict(self.client.find_by_id(todo_item.id))

    def delete_by_id(self, id: str):
        return self.client.delete(id)

    def get(self, id: str) -> TodoItem:
        todo_item = self.client.find_by_id(id)
        if todo_item is None:
            raise TodoItemNotFoundError
        return TodoItem.from_dict(todo_item)

    def create(self, todo_item: TodoItem) -> Optional[TodoItem]:
        inserted_document = self.client.create(to_dict(todo_item))
        return TodoItem.from_dict(inserted_document)

    def get_all(self) -> list[TodoItem]:
        bson_list = self.client.list()
        todo_items = []
        for bson_item in bson_list:
            todo_items.append(TodoItem.from_dict(bson_item))
        return todo_items
