from typing import List

from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from features.todo.shared_models import TodoItemResponseModel


def get_todo_all_use_case(
    user_id: str,
    todo_repository: TodoRepositoryInterface,
) -> List[TodoItemResponseModel]:
    return [
        TodoItemResponseModel.parse_obj(todo_item)
        for todo_item in todo_repository.get_all()
        if todo_item.user_id == user_id
    ]
