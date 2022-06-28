from typing import List

from pydantic import BaseModel, Field

from common.use_case import use_case_responses
from entities.TodoItem import TodoItem
from infrastructure.repositories.TodoRepository import TodoRepository


class GetTodoAllResponse(BaseModel):
    id: str = Field(...)
    title: str = Field(...)
    is_completed: bool

    @staticmethod
    def from_entity(todo_item: TodoItem):
        return GetTodoAllResponse(id=todo_item.id, title=todo_item.title, is_completed=todo_item.is_completed)


@use_case_responses
def get_todo_all_use_case(
    todo_item_repository=TodoRepository(),
) -> List[GetTodoAllResponse]:
    response: List[GetTodoAllResponse] = []
    todo_items: List[TodoItem] = todo_item_repository.get_all()

    for todo_item in todo_items:
        response.append(GetTodoAllResponse.from_entity(todo_item))

    return response
