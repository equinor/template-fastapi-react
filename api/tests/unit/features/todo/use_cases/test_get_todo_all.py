from features.todo.repository.todo_repository_interface import TodoRepositoryInterface
from features.todo.use_cases.get_todo_all import get_todo_all_use_case


def test_get_todos_should_return_todos(todo_repository: TodoRepositoryInterface, todo_test_data: dict[str, dict]):
    todos = get_todo_all_use_case(user_id="xyz", todo_repository=todo_repository)
    assert len(todos) == len(todo_test_data.keys())
