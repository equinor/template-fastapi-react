import json

from starlette.responses import JSONResponse, PlainTextResponse

from features.todo.use_cases.delete_todo_by_id import delete_todo_use_case


def test_delete_todo_should_return_success(todo_repository):
    id = "dh2109"
    result: JSONResponse = delete_todo_use_case(id=id, todo_item_repository=todo_repository)
    json_result = json.loads(result.body)
    assert json_result["success"]


def test_delete_todo_should_return_not_success(todo_repository):
    id = "unkown"
    result: PlainTextResponse = delete_todo_use_case(id=id, todo_item_repository=todo_repository)
    assert result.body == b"The todo item you specified does not exist."
