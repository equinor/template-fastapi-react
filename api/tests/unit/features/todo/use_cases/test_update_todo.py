from features.todo.repository.todo_repository_interface import TodoRepositoryInterface
from features.todo.use_cases.update_todo import UpdateTodoRequest, update_todo_use_case


def test_update_todo_should_return_success(todo_repository: TodoRepositoryInterface):
    id = "dh2109"
    data = UpdateTodoRequest(title="new title", is_completed=False)
    result = update_todo_use_case(id, data, user_id="xyz", todo_repository=todo_repository)
    assert result.success
