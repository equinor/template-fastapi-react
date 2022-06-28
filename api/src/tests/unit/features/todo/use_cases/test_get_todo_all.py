from typing import List

from features.todo.use_cases.get_todo_all import (
    GetTodoAllResponse,
    get_todo_all_use_case,
)


def test_get_todos_should_return_todos(todo_repository, todo_test_data):
    todos: List[GetTodoAllResponse] = get_todo_all_use_case(todo_item_repository=todo_repository)
    assert len(todos) == len(todo_test_data.keys())
