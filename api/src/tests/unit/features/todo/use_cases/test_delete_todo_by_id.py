import pytest as pytest

from common.exceptions import NotFoundException
from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from features.todo.use_cases.delete_todo_by_id import (
    DeleteTodoByIdResponse,
    delete_todo_use_case,
)


def test_delete_todo_should_return_success(todo_repository: TodoRepositoryInterface):
    id = "dh2109"
    result: DeleteTodoByIdResponse = delete_todo_use_case(id=id, todo_repository=todo_repository)
    assert result.success


def test_delete_todo_should_return_not_success(todo_repository: TodoRepositoryInterface):
    id = "unkown"
    with pytest.raises(NotFoundException) as error:
        delete_todo_use_case(id=id, todo_repository=todo_repository)
        assert error.value.message == "The todo item you specified does not exist."
