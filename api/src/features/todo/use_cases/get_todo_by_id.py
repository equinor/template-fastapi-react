from typing import cast

from pydantic import BaseModel, Field

from entities.TodoItem import TodoItem
from features.todo.exceptions import TodoItemNotFoundError
from infrastructure.repositories.TodoRepository import TodoRepository


class GetTodoByIdResponse(BaseModel):
    id: str = Field(...)
    title: str = Field(...)
    is_completed: bool = False

    @staticmethod
    def from_entity(todo_item: TodoItem):
        return GetTodoByIdResponse(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


def get_todo_by_id_use_case(id: str, todo_item_repository=TodoRepository()) -> GetTodoByIdResponse:
    todo_item = todo_item_repository.get(id)
    if not todo_item:
        raise TodoItemNotFoundError
    return GetTodoByIdResponse.from_entity(cast(TodoItem, todo_item))
