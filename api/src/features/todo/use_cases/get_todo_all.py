from typing import List

from pydantic import BaseModel, Field

from data_providers.repository_interfaces.TodoRepositoryInterface import (
    TodoRepositoryInterface,
)
from entities.TodoItem import TodoItem


class GetTodoAllResponse(BaseModel):
    id: str = Field(...)
    title: str = Field(...)
    is_completed: bool

    @staticmethod
    def from_entity(todo_item: TodoItem):
        return GetTodoAllResponse(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


def get_todo_all_use_case(
    todo_repository: TodoRepositoryInterface,
) -> List[GetTodoAllResponse]:
    response: List[GetTodoAllResponse] = []
    todo_items: List[TodoItem] = todo_repository.get_all()

    for todo_item in todo_items:
        response.append(GetTodoAllResponse.from_entity(todo_item))

    return response
