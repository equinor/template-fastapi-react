from features.todo.use_cases.update_todo import UpdateTodoRequest, update_todo_use_case


def test_update_todos_should_return_success(todo_repository, todo_test_data):
    id = "dh2109"
    data = UpdateTodoRequest(title="new title", is_completed=False)
    result = update_todo_use_case(id, data, todo_repository=todo_repository)
    assert result.success
