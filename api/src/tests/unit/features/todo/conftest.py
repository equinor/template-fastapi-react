from typing import Dict
from unittest import mock

import pytest

from common.exceptions import EntityNotFoundException
from features.todo.exceptions import TodoItemNotFoundError
from infrastructure.clients.ClientInterface import ClientInterface
from infrastructure.repositories.TodoRepository import TodoRepository


@pytest.fixture(scope="function")
def todo_test_data() -> Dict[str, dict]:
    return {
        "dh2109": {"id": "dh2109", "title": "item 1", "is_completed": False},
        "1417b8": {"id": "1417b8", "title": "item 2", "is_completed": True},
        "abcdefg": {"id": "abcdefg", "title": "item 3", "is_completed": False},
    }


def mock_client(test_data: Dict[str, dict]):
    client: ClientInterface = mock.Mock()

    def mock_create(document: Dict) -> Dict:
        return document

    def mock_find_by_id(id: str) -> Dict:
        if id in test_data.keys():
            return test_data[id]
        raise TodoItemNotFoundError()

    def mock_get_all():
        document_list = []
        for (k, v) in test_data.items():
            document_list.append(v)
        return document_list

    def mock_delete(id: str) -> bool:
        if id in test_data.keys():
            test_data.pop(id)
            return True
        return False

    def mock_update(id: str, document: Dict):
        if id not in list(test_data.keys()):
            raise EntityNotFoundException()
        test_data[id] = document
        return test_data[id]

    client.create = mock_create
    client.find_by_id.side_effect = mock_find_by_id
    client.list = mock_get_all
    client.delete = mock_delete
    client.update = mock_update

    return client


@pytest.fixture(scope="function")
def todo_repository(todo_test_data):
    yield TodoRepository(client=mock_client(todo_test_data))
