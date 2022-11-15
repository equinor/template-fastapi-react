import pytest as pytest

from common.exceptions import NotFoundException
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from features.todo.use_cases.delete_todo_by_id import delete_todo_use_case


def test_delete_todo_should_return_success(todo_repository: TodoRepositoryInterface):
    id = "dh2109"
    try:
        delete_todo_use_case(id=id, user_id="xyz", todo_repository=todo_repository)
    except Exception:
        assert False


def test_delete_todo_should_return_not_success(todo_repository: TodoRepositoryInterface):
    id = "unkown"
    with pytest.raises(NotFoundException):
        delete_todo_use_case(id=id, user_id="xyz", todo_repository=todo_repository)
