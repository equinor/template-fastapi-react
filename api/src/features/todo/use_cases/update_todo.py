from common.entity_mapper import filter_fields
from common.exceptions import MissingPrivilegeException
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from entities.TodoItem import TodoItem
from features.todo.shared_models import TodoItemResponseModel


@filter_fields(name="UpdateTodo")
class UpdateTodoRequest(TodoItem):
    class Config:
        include = ["title", "is_completed"]


def update_todo_use_case(
    id: str,
    data: UpdateTodoRequest,
    user_id: str,
    todo_repository: TodoRepositoryInterface,
) -> TodoItemResponseModel:
    todo_item = todo_repository.get(id)
    if todo_item.user_id != user_id:
        raise MissingPrivilegeException
    updated_todo_item = TodoItem(id=todo_item.id, title=data.title, is_completed=data.is_completed, user_id=user_id)
    todo_repository.update(updated_todo_item)
    return TodoItemResponseModel.parse_obj(updated_todo_item)
