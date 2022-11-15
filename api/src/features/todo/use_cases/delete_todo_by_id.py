from common.exceptions import MissingPrivilegeException, NotFoundException
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)


def delete_todo_use_case(id: str, user_id: str, todo_repository: TodoRepositoryInterface) -> None:
    todo_item = todo_repository.get(id)
    if todo_item is None:
        raise NotFoundException
    if todo_item.user_id != user_id:
        raise MissingPrivilegeException
    todo_repository.delete(id)
