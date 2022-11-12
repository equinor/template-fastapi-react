from common.exceptions import MissingPrivilegeException
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from features.todo.shared_models import TodoItemResponseModel


def get_todo_by_id_use_case(id: str, user_id: str, todo_repository: TodoRepositoryInterface) -> TodoItemResponseModel:
    todo_item = todo_repository.get(id)
    if todo_item.user_id != user_id:
        raise MissingPrivilegeException
    return TodoItemResponseModel.parse_obj(todo_item)
