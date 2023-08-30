import pytest

from features.todo.repository.todo_repository import TodoRepository


@pytest.fixture(scope="function")
def todo_test_data() -> dict[str, dict]:
    return {
        "dh2109": {"_id": "dh2109", "title": "item 1", "is_completed": False, "user_id": "xyz"},
        "1417b8": {"_id": "1417b8", "title": "item 2", "is_completed": True, "user_id": "xyz"},
        "abcdefg": {"_id": "abcdefg", "title": "item 3", "is_completed": False, "user_id": "xyz"},
    }


@pytest.fixture(scope="function")
def todo_repository(test_client, todo_test_data):
    test_client.insert_many(todo_test_data.values())
    yield TodoRepository(client=test_client)
