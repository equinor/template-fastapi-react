import pytest
from pydantic.error_wrappers import ValidationError

from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from features.todo.use_cases.add_todo import AddTodoRequest, add_todo_use_case


def test_add_with_valid_title_should_return_todo(todo_repository: TodoRepositoryInterface):
    title = "new todo"
    data = AddTodoRequest(title=title)
    result = add_todo_use_case(data=data, user_id="xyz", todo_repository=todo_repository)
    assert result.title == title


def test_add_with_empty_title_should_throw_validation_error(todo_repository: TodoRepositoryInterface):
    with pytest.raises(ValidationError):
        title = ""
        data = AddTodoRequest(title=title)
        add_todo_use_case(data=data, user_id="xyz", todo_repository=todo_repository)
