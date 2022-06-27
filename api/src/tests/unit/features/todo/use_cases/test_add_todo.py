import json

import pytest
from pydantic.error_wrappers import ValidationError
from starlette.responses import JSONResponse

from features.todo.use_cases.add_todo import AddTodoRequest, add_todo_use_case


def test_add_with_valid_title_should_return_todo(todo_repository):
    data = AddTodoRequest(title="new todo")
    result: JSONResponse = add_todo_use_case(data, todo_item_repository=todo_repository)
    json_result = json.loads(result.body)
    assert json_result["title"] == data.title


def test_add_with_empty_title_should_throw_validation_error(todo_repository):
    with pytest.raises(ValidationError):
        data = AddTodoRequest(title="")
        add_todo_use_case(data, todo_item_repository=todo_repository)
