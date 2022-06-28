from starlette.responses import PlainTextResponse

from features.todo.use_cases.delete_todo_by_id import (
    DeleteTodoByIdResponse,
    delete_todo_use_case,
)


def test_delete_todo_should_return_success(todo_repository):
    id = "dh2109"
    result: DeleteTodoByIdResponse = delete_todo_use_case(id=id, todo_item_repository=todo_repository)
    assert result.success


def test_delete_todo_should_return_not_success(todo_repository):
    id = "unkown"
    result: PlainTextResponse = delete_todo_use_case(id=id, todo_item_repository=todo_repository)
    assert result.body == b"The todo item you specified does not exist."
