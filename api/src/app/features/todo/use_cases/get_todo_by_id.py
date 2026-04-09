from typing import Self

from pydantic import BaseModel

from app.common.exceptions import MissingPrivilegeException
from app.features.todo.entities.todo_item import TodoItem
from app.features.todo.repository.todo_repository_interface import TodoRepositoryInterface


class GetTodoByIdResponse(BaseModel):
    id: str
    title: str
    is_completed: bool = False

    @classmethod
    def from_entity(cls, todo_item: TodoItem) -> Self:
        return cls(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


def get_todo_by_id_use_case(id: str, user_id: str, todo_repository: TodoRepositoryInterface) -> GetTodoByIdResponse:
    todo_item = todo_repository.get(id)
    if todo_item.user_id != user_id:
        raise MissingPrivilegeException
    return GetTodoByIdResponse.from_entity(todo_item)
