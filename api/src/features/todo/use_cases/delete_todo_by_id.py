from pydantic import BaseModel, Field

from common.exceptions import NotFoundException
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)


class DeleteTodoByIdResponse(BaseModel):
    success: bool = Field(...)


def delete_todo_use_case(id: str, user_id: str, todo_repository: TodoRepositoryInterface) -> DeleteTodoByIdResponse:
    todo_item = todo_repository.get(id)
    if todo_item is None or todo_item.user_id != user_id:
        raise NotFoundException
    todo_repository.delete(id)
    return DeleteTodoByIdResponse(success=True)
