from pydantic import BaseModel

from common.exceptions import MissingPrivilegeException, NotFoundException
from features.todo.repository.todo_repository_interface import TodoRepositoryInterface


class DeleteTodoByIdResponse(BaseModel):
    success: bool


def delete_todo_use_case(id: str, user_id: str, todo_repository: TodoRepositoryInterface) -> DeleteTodoByIdResponse:
    todo_item = todo_repository.get(id)
    if todo_item is None:
        raise NotFoundException
    if todo_item.user_id != user_id:
        raise MissingPrivilegeException
    todo_repository.delete(id)
    return DeleteTodoByIdResponse(success=True)
