from pydantic import BaseModel, Field

from common.exceptions import MissingPrivilegeException
from features.todo.entities.todo_item import TodoItem
from features.todo.repository.todo_repository_interface import TodoRepositoryInterface


class UpdateTodoRequest(BaseModel):
    title: str = Field(
        "",
        title="The title of the item",
        max_length=300,
        min_length=1,
    )
    is_completed: bool


class UpdateTodoResponse(BaseModel):
    success: bool


def update_todo_use_case(
    id: str,
    data: UpdateTodoRequest,
    user_id: str,
    todo_repository: TodoRepositoryInterface,
) -> UpdateTodoResponse:
    todo_item = todo_repository.get(id)
    if todo_item.user_id != user_id:
        raise MissingPrivilegeException

    updated_todo_item = TodoItem(id=todo_item.id, title=data.title, is_completed=data.is_completed, user_id=user_id)
    if todo_repository.update(updated_todo_item):
        return UpdateTodoResponse(success=True)
    return UpdateTodoResponse(success=False)
