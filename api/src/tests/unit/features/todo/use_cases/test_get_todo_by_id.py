from typing import Dict

import pytest as pytest

from common.exceptions import NotFoundException
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from features.todo.use_cases.get_todo_by_id import (
    GetTodoByIdResponse,
    get_todo_by_id_use_case,
)


def test_get_todo_by_id_should_return_todo(todo_repository: TodoRepositoryInterface, todo_test_data: Dict[str, dict]):
    id = "dh2109"
    todo: GetTodoByIdResponse = get_todo_by_id_use_case(id, todo_repository=todo_repository)
    assert todo.title == todo_test_data[id]["title"]


def test_get_todo_by_id_should_throw_todo_not_found_error(todo_repository: TodoRepositoryInterface):
    id = "unknown"
    with pytest.raises(NotFoundException) as error:
        get_todo_by_id_use_case(id, todo_repository=todo_repository)
        assert error.value.message == "The todo item you specified does not exist."
