from typing import List

from common.use_case_executor import use_case_executor
from features.todo.use_cases.update_todo import (
    UpdateTodoRequest,
    UpdateTodoResponse,
    update_todo_use_case,
)


def test_update_todos_should_return_success(todo_repository, todo_test_data):
    id = "dh2109"
    data = UpdateTodoRequest(title="new title", is_completed=False)
    result: UpdateTodoResponse = use_case_executor(
        update_todo_use_case, id, data, todo_item_repository=todo_repository
    )
    assert result.success == True
