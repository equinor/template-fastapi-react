from typing import List

from common.use_case_executor import use_case_executor
from features.todo.use_cases.delete_todo_by_id import (
    DeleteTodoByIdResponse,
    delete_todo_use_case,
)


def test_delete_todo_should_return_success(todo_repository):
    id = "dh2109"
    result: DeleteTodoByIdResponse = use_case_executor(
        delete_todo_use_case, id=id, todo_item_repository=todo_repository
    )
    assert result.success == True


def test_delete_todo_should_return_not_success(todo_repository):
    id = "unkown"
    result: DeleteTodoByIdResponse = use_case_executor(
        delete_todo_use_case, id=id, todo_item_repository=todo_repository
    )
    assert result.success == False
