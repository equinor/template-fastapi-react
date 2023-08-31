from typing import cast

from pydantic import BaseModel

from common.exceptions import MissingPrivilegeException
from features.todo.entities.todo_item import TodoItem
from features.todo.repository.todo_repository_interface import TodoRepositoryInterface


class GetTodoByIdResponse(BaseModel):
    id: str
    title: str
    is_completed: bool = False

    @staticmethod
    def from_entity(todo_item: TodoItem) -> "GetTodoByIdResponse":
        return GetTodoByIdResponse(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


def get_todo_by_id_use_case(id: str, user_id: str, todo_repository: TodoRepositoryInterface) -> GetTodoByIdResponse:
    todo_item = todo_repository.get(id)
    if todo_item.user_id != user_id:
        raise MissingPrivilegeException
    return GetTodoByIdResponse.from_entity(cast(TodoItem, todo_item))
