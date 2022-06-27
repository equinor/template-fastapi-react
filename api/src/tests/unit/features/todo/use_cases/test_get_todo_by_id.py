import json

from starlette.responses import JSONResponse, PlainTextResponse
from starlette.status import HTTP_404_NOT_FOUND

from features.todo.use_cases.get_todo_by_id import get_todo_by_id_use_case


def test_get_todo_by_id_should_return_todo(todo_repository, todo_test_data):
    id = "dh2109"
    response: JSONResponse = get_todo_by_id_use_case(id, todo_item_repository=todo_repository)
    todo = json.loads(response.body)
    assert todo["title"] == todo_test_data[id]["title"]


def test_get_todo_by_id_should_throw_todo_not_found_error(todo_repository):
    id = "unknown"
    result: PlainTextResponse = get_todo_by_id_use_case(id, todo_item_repository=todo_repository)
    assert result.body == b"The todo item you specified does not exist."
    assert result.status_code == HTTP_404_NOT_FOUND
